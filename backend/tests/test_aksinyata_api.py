# AKSINYATA API regression tests: public endpoints, auth guards, admin CRUD (needs ADMIN_TOKEN / MEMBER_TOKEN env = Clerk JWT)
import os
import io
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN")
MEMBER_TOKEN = os.environ.get("MEMBER_TOKEN")


@pytest.fixture
def s():
    return requests.Session()


@pytest.fixture
def admin():
    if not ADMIN_TOKEN:
        pytest.skip("ADMIN_TOKEN not set")
    x = requests.Session()
    x.headers["Authorization"] = f"Bearer {ADMIN_TOKEN}"
    return x


# ---- Public ----
class TestPublic:
    def test_projects_only_tayang(self, s):
        r = s.get(f"{BASE_URL}/api/public/projects")
        assert r.status_code == 200
        d = r.json()
        assert len(d) >= 15
        assert all(p["verification_status"] == "tayang" for p in d)
        assert all("_id" not in p for p in d)

    def test_project_filters(self, s):
        r = s.get(f"{BASE_URL}/api/public/projects", params={"sector_id": "infrastruktur"})
        assert r.status_code == 200
        assert all(p["sector_id"] == "infrastruktur" for p in r.json())

    def test_project_detail_and_404(self, s):
        p = s.get(f"{BASE_URL}/api/public/projects").json()[0]
        r = s.get(f"{BASE_URL}/api/public/projects/{p['id']}")
        assert r.status_code == 200 and r.json()["id"] == p["id"]
        assert s.get(f"{BASE_URL}/api/public/projects/nonexistent").status_code == 404

    def test_kecamatan(self, s):
        r = s.get(f"{BASE_URL}/api/public/kecamatan")
        assert r.status_code == 200
        d = r.json()
        assert len(d) == 29
        k = d[0]
        r2 = s.get(f"{BASE_URL}/api/public/kecamatan/{k['id']}")
        assert r2.status_code == 200
        j = r2.json()
        assert j["kecamatan"]["id"] == k["id"]
        assert all(p["verification_status"] == "tayang" for p in j["projects"])
        assert s.get(f"{BASE_URL}/api/public/kecamatan/xxx").status_code == 404

    def test_updates_issues_indicators_tayang(self, s):
        for ep in ["field-updates", "issues", "indicators"]:
            r = s.get(f"{BASE_URL}/api/public/{ep}")
            assert r.status_code == 200, ep
            assert all(x["verification_status"] == "tayang" for x in r.json()), ep

    def test_stats(self, s):
        d = s.get(f"{BASE_URL}/api/public/stats").json()
        assert d["total"] == d["rencana"] + d["berjalan"] + d["selesai"]
        assert d["kecamatan_total"] == 29

    def test_settings(self, s):
        assert s.get(f"{BASE_URL}/api/public/settings").status_code == 200

    def test_csv_export(self, s):
        r = s.get(f"{BASE_URL}/api/public/data/projects.csv")
        assert r.status_code == 200
        assert "text/csv" in r.headers["content-type"]
        assert r.text.startswith("id,name")

    def test_feedback_validation(self, s):
        r = s.post(f"{BASE_URL}/api/public/feedback", json={"name": "x"})
        assert r.status_code == 422

    def test_feedback_empty_message(self, s):
        # empty message should be rejected (reported if accepted)
        r = s.post(f"{BASE_URL}/api/public/feedback", json={"name": "TEST_empty", "message": ""})
        if r.status_code == 200 and ADMIN_TOKEN:
            requests.delete(f"{BASE_URL}/api/admin/feedback/{r.json()['id']}", headers={"Authorization": f"Bearer {ADMIN_TOKEN}"})
        assert r.status_code in (400, 422)


# ---- Auth guards ----
ADMIN_GETS = ["projects", "field-updates", "issues", "indicators", "kecamatan", "feedback"]


class TestAuthGuards:
    @pytest.mark.parametrize("ep", ADMIN_GETS)
    def test_401_without_token(self, s, ep):
        assert s.get(f"{BASE_URL}/api/admin/{ep}").status_code == 401

    def test_401_bad_token(self, s):
        r = s.get(f"{BASE_URL}/api/admin/projects", headers={"Authorization": "Bearer abc"})
        assert r.status_code == 401

    def test_me_401(self, s):
        assert s.get(f"{BASE_URL}/api/me").status_code == 401

    def test_403_member(self, s):
        if not MEMBER_TOKEN:
            pytest.skip("MEMBER_TOKEN not set")
        h = {"Authorization": f"Bearer {MEMBER_TOKEN}"}
        assert s.get(f"{BASE_URL}/api/me", headers=h).json()["role"] == "member"
        for ep in ADMIN_GETS:
            assert s.get(f"{BASE_URL}/api/admin/{ep}", headers=h).status_code == 403, ep
        assert s.put(f"{BASE_URL}/api/admin/settings", headers=h, json={}).status_code == 403


# ---- Admin CRUD ----
PROJ = {
    "name": "TEST_Proyek API", "sector_id": "infrastruktur", "kecamatan_id": "balaraja",
    "kecamatan_name": "Balaraja", "status": "berjalan", "progress_pct": 40,
    "latitude": -6.2, "longitude": 106.45, "verification_status": "draft",
}


class TestAdmin:
    def test_me_admin(self, admin):
        assert admin.get(f"{BASE_URL}/api/me").json()["role"] == "admin"

    def test_project_workflow(self, admin, s):
        r = admin.post(f"{BASE_URL}/api/admin/projects", json=PROJ)
        assert r.status_code == 200, r.text
        p = r.json()
        pid = p["id"]
        try:
            assert s.get(f"{BASE_URL}/api/public/projects/{pid}").status_code == 404
            for st in ["sudah_dicek_opd", "tayang"]:
                u = admin.put(f"{BASE_URL}/api/admin/projects/{pid}", json={**p, "verification_status": st})
                assert u.status_code == 200 and u.json()["verification_status"] == st
                if st == "sudah_dicek_opd":
                    assert s.get(f"{BASE_URL}/api/public/projects/{pid}").status_code == 404
            g = s.get(f"{BASE_URL}/api/public/projects/{pid}")
            assert g.status_code == 200 and g.json()["name"] == PROJ["name"]
            bad = admin.put(f"{BASE_URL}/api/admin/projects/{pid}", json={**p, "status": "xx"})
            assert bad.status_code == 400
        finally:
            assert admin.delete(f"{BASE_URL}/api/admin/projects/{pid}").status_code == 200
        assert admin.delete(f"{BASE_URL}/api/admin/projects/{pid}").status_code == 404

    def test_csv_import(self, admin):
        csv_text = ("name,sector_id,kecamatan_id,status,latitude,longitude\n"
                    "TEST_CSV1,infrastruktur,balaraja,berjalan,-6.2,106.4\n"
                    ",infrastruktur,balaraja,berjalan,-6.2,106.4\n")
        r = admin.post(f"{BASE_URL}/api/admin/projects/import-csv",
                       files={"file": ("t.csv", csv_text, "text/csv")})
        assert r.status_code == 200
        d = r.json()
        assert d["imported"] == 1 and len(d["errors"]) == 1
        rows = [x for x in admin.get(f"{BASE_URL}/api/admin/projects").json() if x["name"] == "TEST_CSV1"]
        assert rows and rows[0]["verification_status"] == "draft"
        for x in rows:
            admin.delete(f"{BASE_URL}/api/admin/projects/{x['id']}")

    @pytest.mark.parametrize("res,body,upd", [
        ("field-updates", {"title": "TEST_kabar", "body": "b", "sector_id": "infrastruktur", "kecamatan_id": "balaraja"}, {"title": "TEST_kabar2"}),
        ("issues", {"title": "TEST_isu", "description": "d", "sector_id": "infrastruktur", "kecamatan_id": "balaraja"}, {"title": "TEST_isu2"}),
        ("indicators", {"label": "TEST_ind", "unit": "%", "realisasi": 1, "target": 2, "sector_id": "infrastruktur"}, {"label": "TEST_ind2"}),
    ])
    def test_crud(self, admin, res, body, upd):
        r = admin.post(f"{BASE_URL}/api/admin/{res}", json=body)
        assert r.status_code == 200, r.text
        item = r.json()
        u = admin.put(f"{BASE_URL}/api/admin/{res}/{item['id']}", json={**item, **upd})
        assert u.status_code == 200
        lst = admin.get(f"{BASE_URL}/api/admin/{res}").json()
        assert any(x["id"] == item["id"] and all(x[k] == v for k, v in upd.items()) for x in lst)
        assert admin.delete(f"{BASE_URL}/api/admin/{res}/{item['id']}").status_code == 200
        assert not any(x["id"] == item["id"] for x in admin.get(f"{BASE_URL}/api/admin/{res}").json())

    def test_feedback_flow(self, admin, s):
        r = s.post(f"{BASE_URL}/api/public/feedback", json={"name": "TEST_warga", "message": "TEST_pesan"})
        assert r.status_code == 200
        fid = r.json()["id"]
        f = [x for x in admin.get(f"{BASE_URL}/api/admin/feedback").json() if x["id"] == fid]
        assert f and f[0]["status"] == "baru"
        u = admin.put(f"{BASE_URL}/api/admin/feedback/{fid}", json={"status": "selesai", "admin_note": "TEST_note"})
        assert u.status_code == 200 and u.json()["admin_note"] == "TEST_note"
        assert admin.put(f"{BASE_URL}/api/admin/feedback/{fid}", json={"status": "zzz"}).status_code == 400
        assert admin.delete(f"{BASE_URL}/api/admin/feedback/{fid}").status_code == 200

    def test_settings_update(self, admin, s):
        cur = s.get(f"{BASE_URL}/api/public/settings").json()
        r = admin.put(f"{BASE_URL}/api/admin/settings", json={"pemkab_complaint_label": cur.get("pemkab_complaint_label", "")})
        assert r.status_code == 200

    def test_upload_and_fetch(self, admin, s):
        png = (b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
               b"\x00\x00\x00\rIDATx\x9cc\xf8\xcf\xc0\xf0\x1f\x00\x05\x00\x01\xff\x89\x99=\x1d\x00\x00\x00\x00IEND\xaeB`\x82")
        r = admin.post(f"{BASE_URL}/api/admin/upload", files={"file": ("TEST_a.png", png, "image/png")})
        assert r.status_code == 200, r.text
        url = r.json()["url"]
        g = s.get(f"{BASE_URL}{url}")
        assert g.status_code == 200 and g.headers["content-type"].startswith("image/")
        bad = admin.post(f"{BASE_URL}/api/admin/upload", files={"file": ("x.txt", b"hi", "text/plain")})
        assert bad.status_code == 400
