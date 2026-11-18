import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import MapView from "@/components/map/MapView";
import { SECTORS, statusById, sectorById, formatIDR, formatDateID } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useState } from "react";
import ProjectPopup from "@/components/map/ProjectPopup";

export default function WilayahDetail() {
  const { id: slug } = useParams();
  const { data } = useQuery({
    queryKey: ["kec", slug],
    queryFn: () => publicAxios.get(`/public/kecamatan/${slug}`).then((r) => r.data),
  });
  const kec = data?.kecamatan;
  const projects = data?.projects || [];
  const updates = data?.field_updates || [];
  const [proj, setProj] = useState({ open: false, project: null });

  const sectorCount = {};
  projects.forEach((p) => (sectorCount[p.sector_id] = (sectorCount[p.sector_id] || 0) + 1));
  const grouped = { rencana: [], berjalan: [], selesai: [] };
  projects.forEach((p) => grouped[p.status]?.push(p));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-8">
        <Link to="/wilayah" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-teal-300 mb-4">
          <ArrowLeft size={14} /> Daftar kecamatan
        </Link>
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Kecamatan</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50">{kec?.name || "…"}</h1>
        {kec?.is_approximate && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] mono text-amber-400">
            <AlertTriangle size={11} /> Titik lokasi masih perkiraan — menunggu unggahan GeoJSON.
          </div>
        )}

        <div className="relative mt-6 h-[320px] rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
          {kec && (
            <MapView
              projects={projects}
              kecamatan={kec ? [kec] : []}
              activeSectors={[]}
              onProjectClick={(p) => setProj({ open: true, project: p })}
              focus={{ lat: kec.latitude, lng: kec.longitude, zoom: 13 }}
            />
          )}
        </div>

        <section className="mt-8">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">8 Sektor</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {SECTORS.map((s) => (
              <div key={s.id} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-center">
                <div className="text-[10px] uppercase tracking-wide text-slate-500 mono truncate">{s.short}</div>
                <div className="mono font-bold text-lg text-slate-100 mt-0.5">{sectorCount[s.id] || 0}</div>
              </div>
            ))}
          </div>
        </section>

        {["berjalan", "selesai", "rencana"].map((st) => (
          <section key={st} className="mt-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: statusById(st).hex }} />
              <span className="text-sm font-semibold text-slate-100">{statusById(st).label}</span>
              <span className="text-xs text-slate-500 mono">({grouped[st].length})</span>
            </div>
            {grouped[st].length === 0 ? (
              <div className="text-xs text-slate-500 mono">Tidak ada data.</div>
            ) : (
              <ul className="space-y-2">
                {grouped[st].map((p) => (
                  <li key={p.id} className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <Link to={`/proyek/${p.id}`} className="text-slate-100 font-medium hover:text-teal-300">{p.name}</Link>
                      <div className="mt-1 text-[11px] mono text-slate-500">{sectorById(p.sector_id).short} • {formatIDR(p.budget)} • {p.opd || "-"}</div>
                      <Progress value={p.progress_pct || 0} className="h-1 mt-2 bg-slate-800 max-w-md" />
                    </div>
                    <Badge variant="outline" className={`${statusById(st).chip} text-[11px] shrink-0`}>{statusById(st).label}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {updates.length > 0 && (
          <section className="mt-8">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">Kabar Lapangan</div>
            <ul className="space-y-2">
              {updates.map((u) => (
                <li key={u.id} className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm">
                  <div className="text-slate-100 font-medium">{u.title}</div>
                  <div className="text-[11px] mono text-slate-500 mt-0.5">{formatDateID(u.date)}</div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <ProjectPopup open={proj.open} onOpenChange={(o) => setProj({ ...proj, open: o })} project={proj.project} />
      <Footer />
    </div>
  );
}
