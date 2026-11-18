import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { VERIFICATION_LIST } from "@/lib/constants";
import { useAdminApi } from "./useAdminApi";

const RESOURCES = [
  { key: "projects", label: "Proyek", to: "/admin/proyek" },
  { key: "field-updates", label: "Kabar Lapangan", to: "/admin/kabar" },
  { key: "issues", label: "Respons Isu", to: "/admin/isu" },
  { key: "indicators", label: "Capaian & Target", to: "/admin/capaian" },
];

const ResourceCard = ({ r }) => {
  const api = useAdminApi();
  const { data = [] } = useQuery({ queryKey: ["admin", r.key], queryFn: async () => (await api.get(`/admin/${r.key}`)).data });
  return (
    <Link to={r.to} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 hover:border-cyan-500/40 transition-colors" data-testid={`overview-card-${r.key}`}>
      <div className="flex items-baseline justify-between">
        <div className="text-sm text-slate-400">{r.label}</div>
        <div className="text-3xl font-bold text-slate-50 mono">{data.length}</div>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        {VERIFICATION_LIST.map((v) => (
          <div key={v.id} className="flex items-center justify-between text-xs">
            <span className={`px-2 py-0.5 rounded border ${v.chip}`}>{v.label}</span>
            <span className="mono text-slate-300" data-testid={`overview-${r.key}-${v.id}`}>{data.filter((d) => d.verification_status === v.id).length}</span>
          </div>
        ))}
      </div>
    </Link>
  );
};

export default function AdminOverview() {
  const api = useAdminApi();
  const { data: fb = [] } = useQuery({ queryKey: ["admin", "feedback"], queryFn: async () => (await api.get("/admin/feedback")).data });
  const baru = fb.filter((f) => (f.status || "baru") === "baru").length;
  return (
    <div data-testid="admin-overview">
      <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Ringkasan</div>
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-50 mt-1">Panel Admin AKSINYATA</h1>
      <p className="text-sm text-slate-400 mt-2 max-w-2xl">Alur kerja: <b className="text-slate-200">Draft</b> → <b className="text-indigo-300">Sudah dicek ke OPD</b> → <b className="text-emerald-300">Tayang</b>. Hanya item berstatus Tayang yang terlihat publik.</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mt-8">
        {RESOURCES.map((r) => <ResourceCard key={r.key} r={r} />)}
      </div>
      <Link to="/admin/masukan" className="mt-4 inline-flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/30 px-5 py-4 hover:border-amber-400/60" data-testid="overview-feedback-card">
        <span className="text-3xl font-bold mono text-amber-300">{baru}</span>
        <span className="text-sm text-amber-100">masukan warga baru menunggu tindak lanjut</span>
      </Link>
    </div>
  );
}
