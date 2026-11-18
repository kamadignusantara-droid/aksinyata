import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import { SECTORS, STATUS_LIST, formatDateID, formatIDR, statusById } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, ArrowLeft } from "lucide-react";

export default function SektorDetail() {
  const { id } = useParams();
  const sector = SECTORS.find((s) => s.id === id) || SECTORS[0];

  const { data: projects = [] } = useQuery({
    queryKey: ["sektor", id, "projects"],
    queryFn: () => publicAxios.get("/public/projects", { params: { sector_id: id } }).then((r) => r.data),
  });
  const { data: indicators = [] } = useQuery({
    queryKey: ["sektor", id, "indicators"],
    queryFn: () => publicAxios.get("/public/indicators", { params: { sector_id: id } }).then((r) => r.data),
  });
  const { data: updates = [] } = useQuery({
    queryKey: ["sektor", id, "updates"],
    queryFn: () => publicAxios.get("/public/field-updates").then((r) => r.data.filter((u) => u.sector_id === id)),
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <Link to="/sektor" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300 mb-4">
          <ArrowLeft size={14} /> Semua sektor
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-md border" style={{ background: `${sector.color}22`, borderColor: `${sector.color}66` }} />
          <div className="text-[10px] uppercase tracking-widest mono" style={{ color: sector.color }}>Sektor</div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">{sector.name}</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Ringkasan indikator, target vs realisasi, serta daftar proyek pada sektor ini di Kabupaten Tangerang.
        </p>

        <section className="mt-8">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">Indikator Kunci</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {indicators.length === 0 && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-500 col-span-full">
                Belum ada indikator Tayang untuk sektor ini.
              </div>
            )}
            {indicators.map((i) => {
              const pct = i.target > 0 ? Math.round((i.realisasi / i.target) * 100) : 0;
              const Trend = i.trend === "naik" ? TrendingUp : i.trend === "turun" ? TrendingDown : Minus;
              return (
                <div key={i.id} data-testid={`indicator-${i.id}`} className="rounded-xl bg-slate-900 border border-slate-800 p-4">
                  <div className="text-xs text-slate-400">{i.label}</div>
                  <div className="flex items-baseline gap-2 mt-1">
                    <div className="mono font-bold text-2xl text-cyan-300">{i.realisasi.toLocaleString("id-ID")}</div>
                    <div className="mono text-xs text-slate-500">{i.unit}</div>
                    <Trend size={14} className="ml-auto text-emerald-400" />
                  </div>
                  <Progress value={pct} className="h-1 mt-3 bg-slate-800" />
                  <div className="mt-1.5 flex items-center justify-between text-[10px] mono text-slate-500">
                    <span>Target {i.target.toLocaleString("id-ID")} {i.unit}</span>
                    <span>{formatDateID(i.data_date)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Proyek pada sektor ini</div>
            <span className="mono text-xs text-slate-500">{projects.length} proyek</span>
          </div>
          <ul className="space-y-2">
            {projects.map((p) => {
              const s = statusById(p.status);
              return (
                <li key={p.id} className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <Link to={`/proyek/${p.id}`} className="text-slate-100 font-medium hover:text-cyan-300">{p.name}</Link>
                    <div className="mt-1 text-[11px] mono text-slate-500">{p.kecamatan_name || p.kecamatan_id} • {formatIDR(p.budget)} • {p.opd || "-"}</div>
                    <Progress value={p.progress_pct || 0} className="h-1 mt-2 bg-slate-800 max-w-md" />
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="outline" className={`${s.chip} text-[11px]`}>{s.label}</Badge>
                    <span className="text-[10px] mono text-slate-500">{p.progress_pct || 0}%</span>
                  </div>
                </li>
              );
            })}
            {projects.length === 0 && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-500">Belum ada proyek Tayang.</div>
            )}
          </ul>
        </section>

        {updates.length > 0 && (
          <section className="mt-10">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">Kabar Lapangan Terkait</div>
            <ul className="space-y-2">
              {updates.slice(0, 6).map((u) => (
                <li key={u.id} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm">
                  <div className="text-slate-100 font-medium">{u.title}</div>
                  <div className="text-[11px] mono text-slate-500 mt-0.5">{formatDateID(u.date)}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
