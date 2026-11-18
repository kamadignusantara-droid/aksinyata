# AKSINYATA

Situs publik progres pembangunan Kabupaten Tangerang (peta 2.5D + Panel Admin).

- `frontend/` — React (CRA + craco), dibangun jadi situs statis.
- `backend/` — FastAPI, dijalankan di Vercel sebagai fungsi `api/index.py` di bawah `/api`.
- `backend/initial_data.json` — data awal (diekspor dari Emergent), dimuat otomatis ke koleksi yang masih kosong.

## Variabel lingkungan (Vercel → Settings → Environment Variables)

| Nama | Isi |
|---|---|
| `MONGODB_URI` (atau `MONGO_URL`) | Alamat koneksi MongoDB Atlas |
| `DB_NAME` | Nama database (default `aksinyata`) |
| `CLERK_PUBLISHABLE_KEY` | Kunci publik Clerk (`pk_test_…`/`pk_live_…`) |
| `CLERK_SECRET_KEY` | Kunci rahasia Clerk (`sk_…`) |
| `ADMIN_EMAIL` | Email admin, pisahkan dengan koma |

Foto unggahan disimpan di MongoDB (koleksi `file_blobs`), maksimal 4 MB per foto.
