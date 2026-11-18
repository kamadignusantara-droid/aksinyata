# AKSINYATA — PRD

## Original problem statement
Build "AKSINYATA", a public website showing the development progress of Kabupaten Tangerang, Banten, Indonesia.
- Interactive 2.5D map (MapLibre GL JS + OpenFreeMap, no API key): 3D extruded buildings, pitched camera ~50°, smooth fly-to.
- Dark slate UI, translucent HUD, 8 sector overlays, click Kecamatan → side panel, project markers color-coded by status (Rencana, Berjalan, Selesai) with labels.
- Public pages: Beranda (Map), Sektor, Wilayah, Proyek, Capaian & Target, Kabar Lapangan, Data & Laporan, Partisipasi Warga (feedback form), Tentang. Mobile-first.
- Admin Panel (internal): email/password login via Clerk. CRUD Projects, Posts, Issues, Sectors, etc. Workflow Draft → Sudah dicek ke OPD → Tayang (only Tayang public). CSV project import.
- MongoDB + Emergent Object Storage. Seed ~15 "[CONTOH]" projects, 3 updates, 2 issues. Admin email: kamadignusantara@gmail.com.
- Language: Bahasa Indonesia.

## User choices
- Only kamadignusantara@gmail.com may access the admin panel (verified email allow-list via ADMIN_EMAIL).
- Included: CSV import, before/after photo upload, manage citizen feedback in admin.

## Architecture
- Backend FastAPI `server.py` (public `/api/public/*`, admin `/api/admin/*` role-gated), `clerk_auth.py`, `storage.py` (Emergent object storage), `seed.py` (auto-seed on startup).
- Frontend React + react-router + react-query. Public pages in `src/pages`, admin in `src/pages/admin` (AdminLayout guard, generic CrudPage, AdminResources configs, CsvImport, AdminFeedback, AdminSettings). Clerk provider wraps only `/admin/*`.
- Seed images saved locally in `frontend/public/seed/`.

## Implemented
- 2026-10-26: Routing wired; map fixed (container height bug); HUD/search mobile layout; full admin panel (overview, Proyek/Kabar/Isu/Capaian CRUD with workflow advance, CSV import + template, photo upload, Masukan Warga status/note, Pengaturan); backend validation (status, ranges, feedback length); storage key configured. Tested E2E (iteration_1): all core flows pass.

## Backlog
- P1: Kecamatan boundary polygons (GeoJSON) on the map; not-found states for /wilayah/:id & /sektor/:id; marker label decluttering at low zoom.
- P2: Indonesian-locale date picker; rate limiting on public feedback; clean up storage files when photos removed.
- Note: Clerk sign-in card shows "Continue with Google" (Clerk instance setting) — admin access is still restricted to the allow-listed email.
