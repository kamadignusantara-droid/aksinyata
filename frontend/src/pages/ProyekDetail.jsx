import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios, absUrl } from "@/lib/api";
import { statusById, sectorById, formatIDR, formatDateID } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Calendar, Wallet, Building2, CheckCircle2, Circle } from "lucide-react";

export default function ProyekDetail() {
  const { id } = useParams();
  const { data: p, isLoading } = useQuery({
    queryKey: ["public", "project", id],
    queryFn: () => publicAxios.get(`/public/projects/${id}`).then((r) => r.data),
    retry: false,
  });

  if (isLoading) return <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">Memuat…</div>;
  if (!p) return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[900px] mx-auto p-10 text-center text-slate-400">Proyek tidak ditemukan.</main>
    </div>
  );

  const s = statusById(p.status);
  const sec = sectorById(p.sector_id);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-6 py-8">
        <Link to="/proyek" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 mb-4">
          <ArrowLeft size={14} /> Semua proyek
        </Link>

        <div className="flex items-center gap-2 mb-1 text-[10px] uppercase tracking-widest mono" style={{ color: sec.color }}>{sec.name}</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">{p.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <Badge variant="outline" data-testid="project-status-badge" className={`${s.chip}`}>{s.label}</Badge>
          <span className="inline-flex items-center gap-1.5"><MapPin size={13} /> {p.kecamatan_name || p.kecamatan_id}</span>
          <span className="inline-flex items-center gap-1.5 mono">
            {p.latitude?.toFixed(4)}, {p.longitude?.toFixed(4)}
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mono">Sebelum</div>
            {p.before_photo_url ? (
              <img src={absUrl(p.before_photo_url)} alt="Sebelum" className="w-full aspect-video object-cover rounded-lg mt-2" />
            ) : <div className="aspect-video bg-slate-800 rounded-lg mt-2 grid place-items-center text-xs text-slate-600">tidak ada foto</div>}
          </div>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mono">Sesudah / Saat Ini</div>
            {p.after_photo_url ? (
              <img src={absUrl(p.after_photo_url)} alt="Sesudah" className="w-full aspect-video object-cover rounded-lg mt-2" />
            ) : <div className="aspect-video bg-slate-800 rounded-lg mt-2 grid place-items-center text-xs text-slate-600">tidak ada foto</div>}
          </div>
        </div>

        <section className="mt-6 rounded-xl bg-slate-900 border border-slate-800 p-5">
          <div className="flex items-center justify-between text-[11px] mono">
            <span className="text-slate-400 uppercase tracking-widest">Progres</span>
            <span className="text-slate-100 font-semibold">{p.progress_pct || 0}%</span>
          </div>
          <Progress value={p.progress_pct || 0} className="h-2 mt-2 bg-slate-800" />
          <div className="grid gap-4 sm:grid-cols-3 mt-5 text-sm">
            <Info icon={<Calendar size={14} />} label="Mulai" value={formatDateID(p.start_date)} />
            <Info icon={<Calendar size={14} />} label="Target Selesai" value={formatDateID(p.target_end_date)} />
            <Info icon={<Wallet size={14} />} label="Anggaran" value={formatIDR(p.budget)} />
            <Info icon={<Building2 size={14} />} label="OPD" value={p.opd || "-"} />
            <Info icon={<Wallet size={14} />} label="Sumber Dana" value={p.funding_source || "-"} />
            <Info icon={<Calendar size={14} />} label="Terakhir Diperbarui" value={formatDateID(p.updated_at)} />
          </div>
        </section>

        {p.stages?.length > 0 && (
          <section className="mt-6 rounded-xl bg-slate-900 border border-slate-800 p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mono mb-3">Tahapan</div>
            <ul className="space-y-2">
              {p.stages.map((st, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-200">
                  {st.done ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Circle size={16} className="text-slate-600" />}
                  <span className={st.done ? "" : "text-slate-500"}>{st.label}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {p.benefit && (
          <section className="mt-6 rounded-xl bg-slate-900 border border-slate-800 p-5">
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono mb-2">Manfaat Warga</div>
            <p className="text-slate-200">{p.benefit}</p>
          </section>
        )}
        {p.description && (
          <section className="mt-6 rounded-xl bg-slate-900 border border-slate-800 p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500 mono mb-2">Deskripsi</div>
            <p className="text-slate-300 leading-relaxed">{p.description}</p>
          </section>
        )}

        <div className="mt-8 flex gap-3">
          <Link to={`/partisipasi?project=${p.id}`}>
            <Button data-testid="btn-beri-masukan" className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold">Beri masukan</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-slate-500 mono">{icon}{label}</div>
      <div className="text-slate-100 mt-0.5">{value}</div>
    </div>
  );
}
