export const SECTORS = [
  { id: "infrastruktur", name: "Infrastruktur & Mobilitas", short: "Infrastruktur", color: "#06B6D4", icon: "Construction" },
  { id: "ekonomi", name: "Ekonomi & UMKM", short: "Ekonomi", color: "#3B82F6", icon: "Store" },
  { id: "pangan", name: "Pangan & Pertanian", short: "Pangan", color: "#10B981", icon: "Sprout" },
  { id: "pendidikan", name: "Pendidikan", short: "Pendidikan", color: "#8B5CF6", icon: "GraduationCap" },
  { id: "kesehatan", name: "Kesehatan", short: "Kesehatan", color: "#EC4899", icon: "HeartPulse" },
  { id: "sosial", name: "Sosial & Perlindungan", short: "Sosial", color: "#F59E0B", icon: "ShieldCheck" },
  { id: "lingkungan", name: "Lingkungan & Air", short: "Lingkungan", color: "#0284C7", icon: "Droplets" },
  { id: "layanan", name: "Layanan Publik & Tata Kelola", short: "Layanan", color: "#6366F1", icon: "Building2" },
];

export const STATUS_LIST = [
  { id: "rencana", label: "Rencana", hex: "#64748B", chip: "bg-slate-800 text-slate-300 border-slate-600" },
  { id: "berjalan", label: "Berjalan", hex: "#F59E0B", chip: "bg-amber-950/60 text-amber-400 border-amber-500/40" },
  { id: "selesai", label: "Selesai", hex: "#10B981", chip: "bg-emerald-950/60 text-emerald-400 border-emerald-500/40" },
];

export const VERIFICATION_LIST = [
  { id: "draft", label: "Draft", chip: "bg-slate-800 text-slate-300 border-slate-600" },
  { id: "sudah_dicek_opd", label: "Sudah dicek ke OPD", chip: "bg-indigo-950 text-indigo-300 border-indigo-700" },
  { id: "tayang", label: "Tayang", chip: "bg-emerald-950 text-emerald-300 border-emerald-600" },
];

export const sectorById = (id) => SECTORS.find((s) => s.id === id) || SECTORS[0];
export const statusById = (id) => STATUS_LIST.find((s) => s.id === id) || STATUS_LIST[0];
export const verifById = (id) => VERIFICATION_LIST.find((s) => s.id === id) || VERIFICATION_LIST[0];

export const KAB_CENTER = { lat: -6.19, lng: 106.47, zoom: 10.3 };

export const formatIDR = (n) => {
  if (!n) return "Rp 0";
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1).replace(".", ",")} M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(0)} jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export const formatDateID = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  } catch { return "-"; }
};
