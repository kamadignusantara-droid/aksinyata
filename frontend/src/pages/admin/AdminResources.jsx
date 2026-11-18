import { STATUS_LIST, statusById, sectorById, formatDateID } from "@/lib/constants";
import CrudPage from "./CrudPage";
import CsvImport from "./CsvImport";

const STATUS_OPTS = STATUS_LIST.map((s) => ({ id: s.id, label: s.label }));
const V = { key: "verification_status", label: "Status verifikasi", type: "verification", required: true };
const SECTOR = { key: "sector_id", label: "Sektor", type: "sector", required: true };
const KEC = { key: "kecamatan_id", label: "Kecamatan", type: "kecamatan", required: true };

const StatusCell = (r) => <span className="text-xs" style={{ color: statusById(r.status).hex }}>{statusById(r.status).label}</span>;
const SectorCell = (r) => <span className="text-xs whitespace-nowrap" style={{ color: sectorById(r.sector_id).color }}>{sectorById(r.sector_id).short}</span>;

const PROJECT_FIELDS = [
  { key: "name", label: "Nama proyek", required: true, wide: true }, SECTOR, KEC,
  { key: "status", label: "Status proyek", type: "select", options: STATUS_OPTS, required: true },
  { key: "progress_pct", label: "Progres (%)", type: "number", empty: 0 },
  { key: "latitude", label: "Latitude", type: "number", required: true },
  { key: "longitude", label: "Longitude", type: "number", required: true },
  { key: "address", label: "Alamat", wide: true },
  { key: "description", label: "Deskripsi", type: "textarea" },
  { key: "benefit", label: "Manfaat untuk warga", type: "textarea" },
  { key: "budget", label: "Anggaran (Rp)", type: "number", empty: 0 },
  { key: "funding_source", label: "Sumber dana" },
  { key: "opd", label: "OPD pelaksana" },
  { key: "year", label: "Tahun", type: "number" },
  { key: "start_date", label: "Tanggal mulai", type: "date" },
  { key: "target_end_date", label: "Target selesai", type: "date" },
  { key: "before_photo_url", label: "Foto sebelum", type: "image" },
  { key: "after_photo_url", label: "Foto sesudah", type: "image" },
  V,
  { key: "verification_note", label: "Catatan verifikasi OPD", type: "textarea" },
];

export const AdminProjects = () => (
  <CrudPage
    title="Proyek" singular="proyek" resource="projects" fields={PROJECT_FIELDS}
    subtitle="Kelola proyek pembangunan, foto sebelum/sesudah, dan impor massal via CSV."
    toolbar={<CsvImport />}
    emptyItem={{ name: "", sector_id: "", kecamatan_id: "", status: "rencana", progress_pct: 0, latitude: "", longitude: "", year: new Date().getFullYear(), stages: [], verification_status: "draft" }}
    columns={[
      { key: "name", label: "Nama", render: (r) => <div className="max-w-xs font-medium">{r.name}</div> },
      { key: "sector_id", label: "Sektor", render: SectorCell },
      { key: "kecamatan_name", label: "Kecamatan" },
      { key: "status", label: "Status", render: StatusCell },
      { key: "progress_pct", label: "Progres", render: (r) => <span className="mono">{r.progress_pct}%</span> },
    ]}
  />
);

export const AdminFieldUpdates = () => (
  <CrudPage
    title="Kabar Lapangan" singular="kabar" resource="field-updates"
    subtitle="Catatan singkat dari lapangan dengan foto atau video."
    emptyItem={{ title: "", body: "", sector_id: "", kecamatan_id: "", date: new Date().toISOString().slice(0, 10), verification_status: "draft" }}
    fields={[
      { key: "title", label: "Judul", required: true, wide: true },
      { key: "body", label: "Isi", type: "textarea", required: true }, SECTOR, KEC,
      { key: "date", label: "Tanggal", type: "date" },
      { key: "video_url", label: "Link video (opsional)" },
      { key: "photo_url", label: "Foto", type: "image" }, V,
    ]}
    columns={[
      { key: "title", label: "Judul", render: (r) => <div className="max-w-sm font-medium">{r.title}</div> },
      { key: "sector_id", label: "Sektor", render: SectorCell },
      { key: "date", label: "Tanggal", render: (r) => formatDateID(r.date) },
    ]}
  />
);

export const AdminIssues = () => (
  <CrudPage
    title="Respons Isu" singular="isu" resource="issues"
    subtitle="Isu yang muncul di masyarakat dan langkah penanganannya."
    emptyItem={{ title: "", description: "", handling_steps: "", sector_id: "", kecamatan_id: "", status: "rencana", date: new Date().toISOString().slice(0, 10), verification_status: "draft" }}
    fields={[
      { key: "title", label: "Judul isu", required: true, wide: true }, SECTOR, KEC,
      { key: "description", label: "Deskripsi isu", type: "textarea", required: true },
      { key: "handling_steps", label: "Langkah penanganan", type: "textarea" },
      { key: "status", label: "Status penanganan", type: "select", options: STATUS_OPTS },
      { key: "date", label: "Tanggal", type: "date" },
      { key: "latitude", label: "Latitude (opsional)", type: "number" },
      { key: "longitude", label: "Longitude (opsional)", type: "number" }, V,
    ]}
    columns={[
      { key: "title", label: "Isu", render: (r) => <div className="max-w-sm font-medium">{r.title}</div> },
      { key: "sector_id", label: "Sektor", render: SectorCell },
      { key: "status", label: "Penanganan", render: StatusCell },
    ]}
  />
);

const TREND = [{ id: "naik", label: "Naik" }, { id: "stabil", label: "Stabil" }, { id: "turun", label: "Turun" }];

export const AdminIndicators = () => (
  <CrudPage
    title="Capaian & Target" singular="indikator" resource="indicators"
    subtitle="Indikator kinerja per sektor: realisasi dibanding target."
    emptyItem={{ sector_id: "", label: "", unit: "", realisasi: "", target: "", trend: "stabil", verification_status: "draft" }}
    fields={[
      SECTOR, { key: "label", label: "Nama indikator", required: true },
      { key: "unit", label: "Satuan", required: true },
      { key: "realisasi", label: "Realisasi", type: "number", required: true },
      { key: "target", label: "Target", type: "number", required: true },
      { key: "trend", label: "Tren", type: "select", options: TREND },
      { key: "data_date", label: "Tanggal data", type: "date" },
      { key: "note", label: "Catatan", type: "textarea" }, V,
    ]}
    columns={[
      { key: "label", label: "Indikator", render: (r) => <div className="max-w-xs font-medium">{r.label}</div> },
      { key: "sector_id", label: "Sektor", render: SectorCell },
      { key: "realisasi", label: "Realisasi / Target", render: (r) => <span className="mono">{r.realisasi} / {r.target} {r.unit}</span> },
    ]}
  />
);
