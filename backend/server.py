"""AKSINYATA — portal transparansi pembangunan Kabupaten Tangerang."""
import csv
import io
import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional

import requests
from dotenv import load_dotenv
from fastapi import (
    APIRouter,
    Depends,
    FastAPI,
    File,
    HTTPException,
    Response,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from pymongo import ReturnDocument
from starlette.concurrency import run_in_threadpool
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

try:
    from backend.clerk_auth import clerk_router, require_user
    from backend import seed as seed_mod
    from backend import storage as storage_mod
except ModuleNotFoundError:
    from clerk_auth import clerk_router, require_user  # type: ignore
    import seed as seed_mod  # type: ignore
    import storage as storage_mod  # type: ignore

mongo_url = os.environ.get("MONGO_URL") or os.environ["MONGODB_URI"]
client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=10000)
db = client[os.environ.get("DB_NAME", "aksinyata")]

app = FastAPI(title="AKSINYATA API")
api_router = APIRouter(prefix="/api")

# ---------- Roles ----------
ROLES = ["admin", "member"]
RETIRED_ROLES: dict = {}
RANK = {r: len(ROLES) - i for i, r in enumerate(ROLES)}
ENV = "live" if os.environ.get("CLERK_PUBLISHABLE_KEY", "").startswith("pk_live_") else "preview"
IN_ENV = {"env": {"$in": [ENV, None]}}


def effective_role(role) -> str:
    role = RETIRED_ROLES.get(role, role)
    return role if role in ROLES else "member"


def _is_admin_email(user_id: str) -> bool:
    admins = {e.strip().lower() for e in os.environ.get("ADMIN_EMAIL", "").split(",") if e.strip()}
    if not admins:
        return False
    r = requests.get(
        f"https://api.clerk.com/v1/users/{user_id}",
        timeout=10,
        headers={
            "Authorization": f"Bearer {os.environ['CLERK_SECRET_KEY']}",
            "User-Agent": "emergent-app",
        },
    )
    r.raise_for_status()
    emails = r.json().get("email_addresses", [])
    for e in emails:
        addr = e["email_address"].lower()
        verified = (e.get("verification") or {}).get("status") == "verified"
        if addr in admins and verified:
            return True
    return False


async def current_member(user: dict = Depends(require_user)) -> dict:
    uid = user["user_id"]
    member = await db.users.find_one({"user_id": uid}, {"_id": 0})
    if member is None or not member.get("role"):
        role = "admin" if await run_in_threadpool(_is_admin_email, uid) else "member"
        await db.users.update_one(
            {"user_id": uid, "role": {"$in": [None, ""]}},
            {"$set": {"role": role}},
        )
        member = await db.users.find_one_and_update(
            {"user_id": uid},
            {"$setOnInsert": {"user_id": uid, "role": role, "env": ENV}},
            upsert=True,
            projection={"_id": 0},
            return_document=ReturnDocument.AFTER,
        )
    if member.get("env") != ENV:
        await db.users.update_one({"user_id": uid}, {"$set": {"env": ENV}})
    return {**member, "env": ENV, "role": effective_role(member.get("role"))}


def require_role(*roles: str):
    async def check(member: dict = Depends(current_member)) -> dict:
        if member["role"] not in roles:
            raise HTTPException(status_code=403, detail="Not allowed")
        return member
    return check


# ---------- Models ----------
VERIFICATION_STATUSES = {"draft", "sudah_dicek_opd", "tayang"}
PROJECT_STATUSES = {"rencana", "berjalan", "selesai"}


class ProjectBase(BaseModel):
    name: str
    sector_id: str
    kecamatan_id: str
    kecamatan_name: Optional[str] = ""
    address: Optional[str] = ""
    status: str = "rencana"
    progress_pct: int = Field(0, ge=0, le=100)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    description: Optional[str] = ""
    benefit: Optional[str] = ""
    budget: Optional[float] = 0
    funding_source: Optional[str] = ""
    opd: Optional[str] = ""
    year: Optional[int] = None
    start_date: Optional[str] = ""
    target_end_date: Optional[str] = ""
    stages: List[dict] = Field(default_factory=list)
    before_photo_url: Optional[str] = ""
    after_photo_url: Optional[str] = ""
    verification_status: str = "draft"
    verification_note: Optional[str] = ""


class FieldUpdateBase(BaseModel):
    title: str
    body: str
    photo_url: Optional[str] = ""
    video_url: Optional[str] = ""
    sector_id: str
    kecamatan_id: str
    date: Optional[str] = ""
    verification_status: str = "draft"


class IssueBase(BaseModel):
    title: str
    sector_id: str
    kecamatan_id: str
    description: str
    handling_steps: Optional[str] = ""
    status: str = "rencana"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    date: Optional[str] = ""
    verification_status: str = "draft"


class IndicatorBase(BaseModel):
    sector_id: str
    label: str
    unit: str
    realisasi: float
    target: float = Field(gt=0)
    trend: Optional[str] = "stabil"
    data_date: Optional[str] = ""
    note: Optional[str] = ""
    verification_status: str = "draft"


class KecamatanUpdate(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_approximate: Optional[bool] = None
    geojson: Optional[dict] = None


class FeedbackIn(BaseModel):
    name: Optional[str] = Field("", max_length=120)
    message: str = Field(min_length=3, max_length=3000)
    related_project_id: Optional[str] = ""
    contact: Optional[str] = ""


class FeedbackUpdate(BaseModel):
    status: str
    admin_note: Optional[str] = ""


FEEDBACK_STATUSES = {"baru", "ditindaklanjuti", "selesai"}


class SettingsUpdate(BaseModel):
    pemkab_complaint_url: Optional[str] = None
    pemkab_complaint_label: Optional[str] = None
    methodology: Optional[str] = None


def _now():
    return datetime.now(timezone.utc).isoformat()


# ---------- First-run data load ----------
# Serverless hosts (Vercel) may not run startup events, so the initial data is
# loaded lazily on the first API request of each instance, only into empty
# collections. initial_data.json is the snapshot exported from Emergent.
import asyncio
import json as _json

_INITIAL_DATA = ROOT_DIR / "initial_data.json"
_seed_done = False
_seed_lock = asyncio.Lock()


async def ensure_seeded():
    global _seed_done
    if _seed_done:
        return
    async with _seed_lock:
        if _seed_done:
            return
        data = _json.loads(_INITIAL_DATA.read_text(encoding="utf-8")) if _INITIAL_DATA.exists() else {}
        fallback = {
            "kecamatan": seed_mod.seed_kecamatan,
            "projects": seed_mod.seed_projects,
            "field_updates": seed_mod.seed_field_updates,
            "issues": seed_mod.seed_issues,
            "indicators": seed_mod.seed_indicators,
            "settings": lambda: [seed_mod.seed_settings()],
        }
        for name, make in fallback.items():
            if await db[name].count_documents({}) == 0:
                docs = data.get(name) or make()
                if docs:
                    await db[name].insert_many([dict(d) for d in docs])
                    logging.info(f"Seeded {name}: {len(docs)}")
        await db.file_blobs.create_index("path", unique=True)
        _seed_done = True


@app.middleware("http")
async def _seed_middleware(request, call_next):
    if request.url.path.startswith("/api/") and not request.url.path.startswith("/api/__clerk"):
        try:
            await ensure_seeded()
        except Exception as e:  # never block requests on seeding
            logging.error(f"Seeding failed: {e}")
    return await call_next(request)


# ---------- Me ----------
@api_router.get("/me")
async def me(member: dict = Depends(current_member)):
    return {"user_id": member["user_id"], "role": member["role"], "env": member["env"]}


# ---------- Public ----------
@api_router.get("/public/kecamatan")
async def public_kecamatan():
    return await db.kecamatan.find({}, {"_id": 0}).sort("name", 1).to_list(100)


@api_router.get("/public/kecamatan/{slug}")
async def public_kecamatan_detail(slug: str):
    kec = await db.kecamatan.find_one({"id": slug}, {"_id": 0})
    if not kec:
        raise HTTPException(status_code=404, detail="Kecamatan tidak ditemukan")
    projects = await db.projects.find(
        {"kecamatan_id": slug, "verification_status": "tayang"}, {"_id": 0}
    ).to_list(1000)
    updates = await db.field_updates.find(
        {"kecamatan_id": slug, "verification_status": "tayang"}, {"_id": 0}
    ).sort("date", -1).to_list(100)
    return {"kecamatan": kec, "projects": projects, "field_updates": updates}


@api_router.get("/public/projects")
async def public_projects(
    sector_id: Optional[str] = None,
    kecamatan_id: Optional[str] = None,
    status: Optional[str] = None,
    year: Optional[int] = None,
):
    q: dict = {"verification_status": "tayang"}
    if sector_id:
        q["sector_id"] = sector_id
    if kecamatan_id:
        q["kecamatan_id"] = kecamatan_id
    if status:
        q["status"] = status
    if year:
        q["year"] = year
    return await db.projects.find(q, {"_id": 0}).to_list(5000)


@api_router.get("/public/projects/{project_id}")
async def public_project_detail(project_id: str):
    row = await db.projects.find_one(
        {"id": project_id, "verification_status": "tayang"}, {"_id": 0}
    )
    if not row:
        raise HTTPException(status_code=404, detail="Proyek tidak ditemukan")
    return row


@api_router.get("/public/field-updates")
async def public_field_updates():
    return await db.field_updates.find(
        {"verification_status": "tayang"}, {"_id": 0}
    ).sort("date", -1).to_list(500)


@api_router.get("/public/issues")
async def public_issues():
    return await db.issues.find(
        {"verification_status": "tayang"}, {"_id": 0}
    ).sort("date", -1).to_list(500)


@api_router.get("/public/indicators")
async def public_indicators(sector_id: Optional[str] = None):
    q: dict = {"verification_status": "tayang"}
    if sector_id:
        q["sector_id"] = sector_id
    return await db.indicators.find(q, {"_id": 0}).to_list(1000)


@api_router.get("/public/settings")
async def public_settings():
    row = await db.settings.find_one({"id": "singleton"}, {"_id": 0})
    return row or {}


@api_router.get("/public/stats")
async def public_stats():
    pipeline = [
        {"$match": {"verification_status": "tayang"}},
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
    ]
    agg = await db.projects.aggregate(pipeline).to_list(10)
    counts = {row["_id"]: row["count"] for row in agg}
    total = sum(counts.values())
    selesai = counts.get("selesai", 0)
    kec_covered = len(
        await db.projects.distinct("kecamatan_id", {"verification_status": "tayang"})
    )
    latest = await db.projects.find(
        {"verification_status": "tayang"}, {"_id": 0, "updated_at": 1}
    ).sort("updated_at", -1).limit(1).to_list(1)
    latest_updated = latest[0]["updated_at"] if latest else None
    return {
        "total": total,
        "rencana": counts.get("rencana", 0),
        "berjalan": counts.get("berjalan", 0),
        "selesai": selesai,
        "percent_selesai": round((selesai / total) * 100) if total else 0,
        "kecamatan_covered": kec_covered,
        "kecamatan_total": 29,
        "last_updated": latest_updated,
    }


@api_router.post("/public/feedback")
async def submit_feedback(payload: FeedbackIn):
    doc = {
        "id": str(uuid.uuid4()),
        "name": payload.name,
        "message": payload.message,
        "related_project_id": payload.related_project_id,
        "contact": payload.contact,
        "status": "baru",
        "admin_note": "",
        "created_at": _now(),
    }
    await db.feedback.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/public/data/projects.csv")
async def export_projects_csv():
    rows = await db.projects.find({"verification_status": "tayang"}, {"_id": 0}).to_list(10000)
    buf = io.StringIO()
    cols = [
        "id", "name", "sector_id", "kecamatan_name", "status", "progress_pct",
        "latitude", "longitude", "year", "budget", "funding_source", "opd",
        "start_date", "target_end_date", "updated_at",
    ]
    w = csv.DictWriter(buf, fieldnames=cols, extrasaction="ignore")
    w.writeheader()
    for r in rows:
        w.writerow(r)
    buf.seek(0)
    return StreamingResponse(
        iter([buf.read()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=proyek_aksinyata.csv"},
    )


# ========================================================================
# ADMIN ROUTES
# ========================================================================

def _validate_verif(payload: dict):
    if payload.get("verification_status") not in VERIFICATION_STATUSES:
        raise HTTPException(400, "Status verifikasi tidak valid")


def _validate_project(payload: dict):
    if payload.get("status") not in PROJECT_STATUSES:
        raise HTTPException(400, "Status proyek tidak valid")
    _validate_verif(payload)


@api_router.get("/admin/projects")
async def admin_projects(admin: dict = Depends(require_role("admin"))):
    return await db.projects.find({}, {"_id": 0}).sort("updated_at", -1).to_list(5000)


@api_router.post("/admin/projects")
async def admin_create_project(payload: ProjectBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_project(data)
    data["id"] = str(uuid.uuid4())
    data["created_at"] = _now()
    data["updated_at"] = _now()
    data["last_edited_by"] = admin["user_id"]
    data["last_edited_at"] = _now()
    await db.projects.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.put("/admin/projects/{project_id}")
async def admin_update_project(project_id: str, payload: ProjectBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_project(data)
    data["updated_at"] = _now()
    data["last_edited_by"] = admin["user_id"]
    data["last_edited_at"] = _now()
    res = await db.projects.find_one_and_update(
        {"id": project_id}, {"$set": data}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(404, "Proyek tidak ditemukan")
    return res


@api_router.delete("/admin/projects/{project_id}")
async def admin_delete_project(project_id: str, admin: dict = Depends(require_role("admin"))):
    if (await db.projects.delete_one({"id": project_id})).deleted_count == 0:
        raise HTTPException(404, "Proyek tidak ditemukan")
    return {"ok": True}


@api_router.post("/admin/projects/import-csv")
async def admin_import_csv(file: UploadFile = File(...), admin: dict = Depends(require_role("admin"))):
    content = (await file.read()).decode("utf-8", errors="ignore")
    reader = csv.DictReader(io.StringIO(content))
    imported = 0
    errors = []
    for i, row in enumerate(reader, start=2):
        try:
            doc = {
                "id": str(uuid.uuid4()),
                "name": row.get("name", "").strip(),
                "sector_id": row.get("sector_id", "").strip(),
                "kecamatan_id": row.get("kecamatan_id", "").strip(),
                "kecamatan_name": row.get("kecamatan_name", "").strip(),
                "status": row.get("status", "rencana").strip() or "rencana",
                "progress_pct": int(float(row.get("progress_pct", 0) or 0)),
                "latitude": float(row.get("latitude", 0) or 0),
                "longitude": float(row.get("longitude", 0) or 0),
                "year": int(row.get("year", 0) or 0) or None,
                "budget": float(row.get("budget", 0) or 0),
                "funding_source": row.get("funding_source", "").strip(),
                "opd": row.get("opd", "").strip(),
                "address": row.get("address", "").strip(),
                "description": row.get("description", "").strip(),
                "benefit": row.get("benefit", "").strip(),
                "start_date": row.get("start_date", "").strip(),
                "target_end_date": row.get("target_end_date", "").strip(),
                "stages": [],
                "before_photo_url": row.get("before_photo_url", "").strip(),
                "after_photo_url": row.get("after_photo_url", "").strip(),
                "verification_status": row.get("verification_status", "draft").strip() or "draft",
                "verification_note": row.get("verification_note", "").strip(),
                "last_edited_by": admin["user_id"],
                "last_edited_at": _now(),
                "created_at": _now(),
                "updated_at": _now(),
            }
            if not doc["name"] or not doc["sector_id"] or not doc["kecamatan_id"]:
                raise ValueError("name, sector_id, kecamatan_id wajib")
            if not (-90 <= doc["latitude"] <= 90 and -180 <= doc["longitude"] <= 180) or (doc["latitude"] == 0 and doc["longitude"] == 0):
                raise ValueError("latitude/longitude wajib dan harus valid")
            doc["progress_pct"] = max(0, min(100, doc["progress_pct"]))
            if doc["status"] not in PROJECT_STATUSES:
                doc["status"] = "rencana"
            if doc["verification_status"] not in VERIFICATION_STATUSES:
                doc["verification_status"] = "draft"
            await db.projects.insert_one(doc)
            imported += 1
        except Exception as e:
            errors.append({"row": i, "error": str(e)})
    return {"imported": imported, "errors": errors}


@api_router.get("/admin/field-updates")
async def admin_field_updates(admin: dict = Depends(require_role("admin"))):
    return await db.field_updates.find({}, {"_id": 0}).sort("date", -1).to_list(1000)


@api_router.post("/admin/field-updates")
async def admin_create_update(payload: FieldUpdateBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    if data["verification_status"] not in VERIFICATION_STATUSES:
        raise HTTPException(400, "Status verifikasi tidak valid")
    data["id"] = str(uuid.uuid4())
    data["created_at"] = _now()
    data["updated_at"] = _now()
    if not data.get("date"):
        data["date"] = _now()
    await db.field_updates.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.put("/admin/field-updates/{item_id}")
async def admin_update_update(item_id: str, payload: FieldUpdateBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    if data["verification_status"] not in VERIFICATION_STATUSES:
        raise HTTPException(400, "Status verifikasi tidak valid")
    data["updated_at"] = _now()
    res = await db.field_updates.find_one_and_update(
        {"id": item_id}, {"$set": data}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(404)
    return res


@api_router.delete("/admin/field-updates/{item_id}")
async def admin_delete_update(item_id: str, admin: dict = Depends(require_role("admin"))):
    if (await db.field_updates.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(404)
    return {"ok": True}


@api_router.get("/admin/issues")
async def admin_issues(admin: dict = Depends(require_role("admin"))):
    return await db.issues.find({}, {"_id": 0}).sort("date", -1).to_list(1000)


@api_router.post("/admin/issues")
async def admin_create_issue(payload: IssueBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_project(data)
    data["id"] = str(uuid.uuid4())
    data["created_at"] = _now()
    data["updated_at"] = _now()
    if not data.get("date"):
        data["date"] = _now()
    await db.issues.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.put("/admin/issues/{item_id}")
async def admin_update_issue(item_id: str, payload: IssueBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_project(data)
    data["updated_at"] = _now()
    res = await db.issues.find_one_and_update(
        {"id": item_id}, {"$set": data}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(404)
    return res


@api_router.delete("/admin/issues/{item_id}")
async def admin_delete_issue(item_id: str, admin: dict = Depends(require_role("admin"))):
    if (await db.issues.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(404)
    return {"ok": True}


@api_router.get("/admin/indicators")
async def admin_indicators(admin: dict = Depends(require_role("admin"))):
    return await db.indicators.find({}, {"_id": 0}).sort("sector_id", 1).to_list(1000)


@api_router.post("/admin/indicators")
async def admin_create_indicator(payload: IndicatorBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_verif(data)
    data["id"] = str(uuid.uuid4())
    data["created_at"] = _now()
    data["updated_at"] = _now()
    await db.indicators.insert_one(data)
    data.pop("_id", None)
    return data


@api_router.put("/admin/indicators/{item_id}")
async def admin_update_indicator(item_id: str, payload: IndicatorBase, admin: dict = Depends(require_role("admin"))):
    data = payload.model_dump()
    _validate_verif(data)
    data["updated_at"] = _now()
    res = await db.indicators.find_one_and_update(
        {"id": item_id}, {"$set": data}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(404)
    return res


@api_router.delete("/admin/indicators/{item_id}")
async def admin_delete_indicator(item_id: str, admin: dict = Depends(require_role("admin"))):
    if (await db.indicators.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(404)
    return {"ok": True}


@api_router.get("/admin/kecamatan")
async def admin_kecamatan(admin: dict = Depends(require_role("admin"))):
    return await db.kecamatan.find({}, {"_id": 0}).sort("name", 1).to_list(100)


@api_router.put("/admin/kecamatan/{slug}")
async def admin_update_kec(slug: str, payload: KecamatanUpdate, admin: dict = Depends(require_role("admin"))):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    data["updated_at"] = _now()
    res = await db.kecamatan.find_one_and_update(
        {"id": slug}, {"$set": data}, projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    if not res:
        raise HTTPException(404)
    return res


@api_router.get("/admin/feedback")
async def admin_feedback(admin: dict = Depends(require_role("admin"))):
    return await db.feedback.find({}, {"_id": 0}).sort("created_at", -1).to_list(5000)


@api_router.put("/admin/feedback/{item_id}")
async def admin_update_feedback(item_id: str, payload: FeedbackUpdate, admin: dict = Depends(require_role("admin"))):
    if payload.status not in FEEDBACK_STATUSES:
        raise HTTPException(400, "Status masukan tidak valid")
    res = await db.feedback.find_one_and_update(
        {"id": item_id},
        {"$set": {"status": payload.status, "admin_note": payload.admin_note, "updated_at": _now()}},
        projection={"_id": 0}, return_document=ReturnDocument.AFTER,
    )
    if not res:
        raise HTTPException(404)
    return res


@api_router.delete("/admin/feedback/{item_id}")
async def admin_delete_feedback(item_id: str, admin: dict = Depends(require_role("admin"))):
    if (await db.feedback.delete_one({"id": item_id})).deleted_count == 0:
        raise HTTPException(404)
    return {"ok": True}


@api_router.put("/admin/settings")
async def admin_update_settings(payload: SettingsUpdate, admin: dict = Depends(require_role("admin"))):
    data = {k: v for k, v in payload.model_dump().items() if v is not None}
    data["updated_at"] = _now()
    res = await db.settings.find_one_and_update(
        {"id": "singleton"}, {"$set": data}, upsert=True,
        projection={"_id": 0}, return_document=ReturnDocument.AFTER
    )
    return res


@api_router.post("/admin/upload")
async def admin_upload(file: UploadFile = File(...), admin: dict = Depends(require_role("admin"))):
    ext = (file.filename.rsplit(".", 1)[-1] if "." in (file.filename or "") else "bin").lower()
    if ext not in {"jpg", "jpeg", "png", "webp", "gif"}:
        raise HTTPException(400, "Format file tidak didukung")
    uid = admin["user_id"]
    path = f"{storage_mod.APP_NAME}/uploads/{uid}/{uuid.uuid4()}.{ext}"
    data = await file.read()
    if len(data) > storage_mod.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "Ukuran foto maksimal 4 MB")
    content_type = file.content_type or f"image/{ext if ext != 'jpg' else 'jpeg'}"
    result = await storage_mod.put_object(db, path, data, content_type)
    doc = {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": content_type,
        "size": result.get("size", len(data)),
        "owner": uid,
        "is_deleted": False,
        "created_at": _now(),
    }
    await db.files.insert_one(doc)
    public_url = f"/api/public/files/{result['path']}"
    return {"path": result["path"], "url": public_url}


@api_router.get("/public/files/{path:path}")
async def public_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    data, content_type = await storage_mod.get_object(db, path)
    if data is None:
        raise HTTPException(status_code=404, detail="File tidak ditemukan")
    return Response(
        content=data,
        media_type=record.get("content_type", content_type),
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


# ---------- Register ----------
app.include_router(clerk_router)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
