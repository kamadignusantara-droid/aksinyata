"""Seed demo data for AKSINYATA (clearly marked [CONTOH])."""
from datetime import datetime, timezone, timedelta
import uuid

# 29 kecamatan centroids (approximate, must be marked as such in UI)
KECAMATAN_SEEDS = [
    ("Balaraja", -6.187, 106.411),
    ("Cikupa", -6.252, 106.527),
    ("Cisauk", -6.330, 106.645),
    ("Cisoka", -6.251, 106.444),
    ("Curug", -6.252, 106.566),
    ("Gunung Kaler", -6.139, 106.414),
    ("Jambe", -6.316, 106.483),
    ("Jayanti", -6.207, 106.372),
    ("Kelapa Dua", -6.242, 106.620),
    ("Kemiri", -6.038, 106.479),
    ("Kosambi", -6.097, 106.654),
    ("Kresek", -6.154, 106.388),
    ("Kronjo", -6.071, 106.442),
    ("Legok", -6.299, 106.621),
    ("Mauk", -6.055, 106.549),
    ("Mekar Baru", -6.098, 106.381),
    ("Pagedangan", -6.280, 106.637),
    ("Pakuhaji", -6.117, 106.611),
    ("Panongan", -6.278, 106.546),
    ("Pasar Kemis", -6.199, 106.577),
    ("Rajeg", -6.146, 106.518),
    ("Sepatan", -6.166, 106.580),
    ("Sepatan Timur", -6.164, 106.603),
    ("Sindang Jaya", -6.207, 106.533),
    ("Solear", -6.302, 106.400),
    ("Sukadiri", -6.096, 106.552),
    ("Sukamulya", -6.179, 106.460),
    ("Teluknaga", -6.095, 106.705),
    ("Tigaraksa", -6.254, 106.472),
]

SECTORS = [
    ("infrastruktur", "Infrastruktur & Mobilitas"),
    ("ekonomi", "Ekonomi & UMKM"),
    ("pangan", "Pangan & Pertanian"),
    ("pendidikan", "Pendidikan"),
    ("kesehatan", "Kesehatan"),
    ("sosial", "Sosial & Perlindungan"),
    ("lingkungan", "Lingkungan & Air"),
    ("layanan", "Layanan Publik & Tata Kelola"),
]


def slugify(name: str) -> str:
    return name.lower().replace(" ", "-")


def iso_now():
    return datetime.now(timezone.utc).isoformat()


def seed_kecamatan():
    return [
        {
            "id": slugify(name),
            "name": name,
            "latitude": lat,
            "longitude": lng,
            "is_approximate": True,
            "geojson": None,
            "created_at": iso_now(),
            "updated_at": iso_now(),
        }
        for name, lat, lng in KECAMATAN_SEEDS
    ]


# 15 demo projects spread across sectors and kecamatan
DEMO_PROJECTS = [
    # (name, sector, kecamatan, status, progress, benefit, budget, funding, opd)
    ("[CONTOH] Rehabilitasi Jalan Poros Balaraja - Kresek", "infrastruktur", "Balaraja", "berjalan", 65,
     "Jalan utama lebih mulus, waktu tempuh warga antar-kecamatan berkurang.",
     12_500_000_000, "APBD Kabupaten 2026", "Dinas PUPR"),
    ("[CONTOH] Pembangunan Pasar Rakyat Tigaraksa", "ekonomi", "Tigaraksa", "berjalan", 40,
     "Pedagang UMKM punya tempat jualan tetap dan bersih.",
     8_000_000_000, "APBD Kabupaten 2026", "Dinas Perindagkop"),
    ("[CONTOH] Revitalisasi Irigasi Sawah Kronjo", "pangan", "Kronjo", "selesai", 100,
     "Petani dapat air stabil sepanjang tahun untuk 2 kali tanam.",
     3_200_000_000, "DAK Pertanian 2025", "Dinas Pertanian"),
    ("[CONTOH] Pembangunan SMPN Baru Pasar Kemis", "pendidikan", "Pasar Kemis", "rencana", 0,
     "Anak di Pasar Kemis tidak perlu lagi sekolah jauh ke kecamatan lain.",
     15_000_000_000, "APBD Kabupaten 2026", "Dinas Pendidikan"),
    ("[CONTOH] Peningkatan Puskesmas Rajeg", "kesehatan", "Rajeg", "berjalan", 55,
     "Layanan rawat inap 24 jam untuk warga Rajeg dan sekitarnya.",
     6_500_000_000, "APBD Kabupaten 2026", "Dinas Kesehatan"),
    ("[CONTOH] Bantuan Rumah Layak Huni Mauk", "sosial", "Mauk", "berjalan", 30,
     "80 keluarga tidak mampu dapat perbaikan atap, lantai, dan sanitasi.",
     2_400_000_000, "APBD Kabupaten 2026", "Dinas Sosial"),
    ("[CONTOH] Normalisasi Kali Cisadane Hilir Kosambi", "lingkungan", "Kosambi", "berjalan", 25,
     "Risiko banjir di permukiman pinggir sungai berkurang.",
     9_000_000_000, "DAK Air 2026", "Dinas PUPR"),
    ("[CONTOH] Mal Pelayanan Publik Satu Atap Tigaraksa", "layanan", "Tigaraksa", "selesai", 100,
     "Warga mengurus KTP, akta, dan izin usaha di satu tempat.",
     11_000_000_000, "APBD Kabupaten 2024", "Setda / Dinas Dukcapil"),
    ("[CONTOH] Perbaikan Jembatan Cikupa", "infrastruktur", "Cikupa", "selesai", 100,
     "Jalur logistik industri lebih aman, tidak ada lagi antrean kemacetan.",
     4_800_000_000, "APBD Kabupaten 2024", "Dinas PUPR"),
    ("[CONTOH] Pelatihan Digital UMKM Curug", "ekonomi", "Curug", "berjalan", 70,
     "150 pelaku UMKM bisa jualan online dan terima pembayaran digital.",
     850_000_000, "APBD Kabupaten 2026", "Dinas Perindagkop"),
    ("[CONTOH] Sentra Tani Hortikultura Legok", "pangan", "Legok", "rencana", 0,
     "Kebun sayur kolektif dengan rumah pengemasan untuk petani lokal.",
     5_200_000_000, "APBD Kabupaten 2026", "Dinas Pertanian"),
    ("[CONTOH] Beasiswa SMK Vokasi Pagedangan", "pendidikan", "Pagedangan", "berjalan", 85,
     "500 siswa SMK dapat subsidi biaya praktik dan sertifikasi.",
     1_750_000_000, "APBD Kabupaten 2026", "Dinas Pendidikan"),
    ("[CONTOH] Posyandu Ramah Anak Teluknaga", "kesehatan", "Teluknaga", "selesai", 100,
     "12 posyandu dapat alat timbang digital dan ruang bermain balita.",
     1_200_000_000, "APBD Kabupaten 2025", "Dinas Kesehatan"),
    ("[CONTOH] Perlindungan Lansia Panongan", "sosial", "Panongan", "rencana", 0,
     "Pendataan dan bantuan rutin untuk lansia di bawah garis kemiskinan.",
     980_000_000, "APBD Kabupaten 2026", "Dinas Sosial"),
    ("[CONTOH] Air Bersih Perpipaan Kemiri", "lingkungan", "Kemiri", "berjalan", 45,
     "600 KK pesisir utara dapat sambungan air bersih layak minum.",
     7_300_000_000, "DAK Air 2026", "PDAM / Dinas PUPR"),
]


def seed_projects():
    out = []
    now = iso_now()
    for i, (name, sector, kec, status, pct, benefit, budget, funding, opd) in enumerate(DEMO_PROJECTS):
        # Find kecamatan centroid
        kec_data = next((k for k in KECAMATAN_SEEDS if k[0] == kec), KECAMATAN_SEEDS[0])
        # tiny offset so markers don't exactly overlap
        lat = kec_data[1] + ((i % 3) - 1) * 0.004
        lng = kec_data[2] + ((i % 4) - 2) * 0.004
        out.append({
            "id": str(uuid.uuid4()),
            "name": name,
            "sector_id": sector,
            "kecamatan_id": slugify(kec),
            "kecamatan_name": kec,
            "address": f"Area {kec}, Kabupaten Tangerang",
            "status": status,
            "progress_pct": pct,
            "latitude": lat,
            "longitude": lng,
            "description": f"Proyek contoh untuk mendemokan tampilan peta AKSINYATA. {benefit}",
            "benefit": benefit,
            "budget": budget,
            "funding_source": funding,
            "opd": opd,
            "year": 2026 if status != "selesai" else 2025,
            "start_date": "2025-03-01",
            "target_end_date": "2026-12-31" if status != "selesai" else "2025-10-30",
            "stages": [
                {"label": "Perencanaan", "done": True},
                {"label": "Lelang", "done": status != "rencana"},
                {"label": "Pelaksanaan", "done": status == "selesai"},
                {"label": "Serah Terima", "done": status == "selesai"},
            ],
            "before_photo_url": "",
            "after_photo_url": "",
            "verification_status": "tayang",
            "verification_note": "Data contoh. Verifikasi OPD belum diperlukan.",
            "last_edited_by": "system-seed",
            "last_edited_at": now,
            "created_at": now,
            "updated_at": now,
        })
    return out


def seed_field_updates():
    now = iso_now()
    recent = (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
    older = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "[CONTOH] Pengecoran Jalan Poros Balaraja dimulai",
            "body": "Tim lapangan memulai pengecoran segmen 1,2 km. Progres saat ini 65%.",
            "photo_url": "/seed/kabar1.jpg",
            "video_url": None,
            "sector_id": "infrastruktur",
            "kecamatan_id": "balaraja",
            "date": recent,
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "title": "[CONTOH] Panen perdana irigasi Kronjo",
            "body": "Petani Kronjo panen dengan hasil 6,2 ton/ha setelah irigasi direvitalisasi.",
            "photo_url": "/seed/kabar2.jpg",
            "video_url": None,
            "sector_id": "pangan",
            "kecamatan_id": "kronjo",
            "date": older,
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "title": "[CONTOH] MPP Tigaraksa layani 320 warga per hari",
            "body": "Mal Pelayanan Publik di Tigaraksa melayani rata-rata 320 warga per hari pada bulan ini.",
            "photo_url": "/seed/kabar3.jpg",
            "video_url": None,
            "sector_id": "layanan",
            "kecamatan_id": "tigaraksa",
            "date": older,
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        },
    ]


def seed_issues():
    now = iso_now()
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "[CONTOH] Genangan air di Jalan Raya Serang KM 24",
            "sector_id": "infrastruktur",
            "kecamatan_id": "cikupa",
            "description": "Warga melaporkan genangan air setinggi 30 cm setiap hujan deras di sekitar KM 24.",
            "handling_steps": "Dinas PUPR menurunkan tim untuk membersihkan saluran drainase dan menambah lubang biopori.",
            "status": "ditangani",
            "latitude": -6.252,
            "longitude": 106.527,
            "date": now,
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        },
        {
            "id": str(uuid.uuid4()),
            "title": "[CONTOH] Lampu PJU mati di Pasar Kemis",
            "sector_id": "layanan",
            "kecamatan_id": "pasar-kemis",
            "description": "Beberapa lampu penerangan jalan umum padam di sekitar Pasar Kemis.",
            "handling_steps": "Dishub & PLN jadwalkan penggantian lampu dan panel surya minggu ini.",
            "status": "rencana",
            "latitude": -6.199,
            "longitude": 106.577,
            "date": now,
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        },
    ]


def seed_indicators():
    now = iso_now()
    base = [
        ("infrastruktur", "Panjang Jalan Mantap", "km", 1250, 1500),
        ("ekonomi", "UMKM Terdaftar", "unit", 4800, 6000),
        ("pangan", "Luas Sawah Irigasi Teknis", "ha", 3200, 4000),
        ("pendidikan", "APK SMP Sederajat", "%", 92, 98),
        ("kesehatan", "Puskesmas Rawat Inap", "unit", 18, 24),
        ("sosial", "Keluarga Penerima Manfaat", "KK", 7200, 9000),
        ("lingkungan", "Cakupan Air Bersih Perpipaan", "%", 48, 70),
        ("layanan", "Layanan MPP Harian", "orang", 320, 500),
    ]
    out = []
    for sector_id, label, unit, realisasi, target in base:
        out.append({
            "id": str(uuid.uuid4()),
            "sector_id": sector_id,
            "label": f"[CONTOH] {label}",
            "unit": unit,
            "realisasi": realisasi,
            "target": target,
            "trend": "naik",
            "data_date": "2026-01-31",
            "note": "Nilai contoh untuk demo tampilan.",
            "verification_status": "tayang",
            "created_at": now,
            "updated_at": now,
        })
    return out


def seed_settings():
    return {
        "id": "singleton",
        "pemkab_complaint_url": "https://lapor.go.id/",
        "pemkab_complaint_label": "Kanal pengaduan resmi Pemkab Tangerang",
        "methodology": "Data proyek dikumpulkan dari OPD terkait, diverifikasi tim AKSINYATA, lalu ditayangkan. Setiap angka selalu disertai tanggal data terakhir.",
        "updated_at": iso_now(),
    }
