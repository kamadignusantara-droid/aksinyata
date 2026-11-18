import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SECTORS, statusById, formatDateID, formatIDR, sectorById } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { MapPin, ExternalLink, AlertTriangle } from "lucide-react";

export default function KecamatanPanel({ open, onOpenChange, data }) {
  const kec = data?.kecamatan;
  const projects = data?.projects || [];
  const updates = data?.field_updates || [];

  // sector mini stats
  const sectorCount = {};
  projects.forEach((p) => {
    sectorCount[p.sector_id] = (sectorCount[p.sector_id] || 0) + 1;
  });

  const grouped = { rencana: [], berjalan: [], selesai: [] };
  projects.forEach((p) => grouped[p.status]?.push(p));

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        data-testid="kecamatan-side-panel"
        side="right"
        className="w-full sm:max-w-[420px] bg-slate-950/98 backdrop-blur-xl border-l border-slate-800 text-slate-100 p-0 overflow-y-auto scrollbar-slim"
      >
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-slate-800">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mono flex items-center gap-1">
            <MapPin size={11} /> Kecamatan
          </div>
          <SheetTitle className="text-slate-50 text-xl font-bold tracking-tight">
            {kec?.name || "—"}
          </SheetTitle>
          {kec?.is_approximate && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mono">
              <AlertTriangle size={11} /> Titik lokasi masih perkiraan
            </div>
          )}
        </SheetHeader>

        <div className="px-5 py-4">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">8 Sektor</div>
          <div className="grid grid-cols-4 gap-2">
            {SECTORS.map((s) => (
              <div key={s.id} className="rounded-lg bg-slate-900 border border-slate-800 p-2 text-center">
                <div className="text-[9px] uppercase tracking-wide text-slate-500 mono truncate">{s.short}</div>
                <div className="mono font-bold text-base text-slate-100 mt-0.5">{sectorCount[s.id] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {["berjalan", "selesai", "rencana"].map((st) => (
          <section key={st} className="px-5 py-3 border-t border-slate-800">
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
                  <li key={p.id} className="rounded-lg bg-slate-900 border border-slate-800 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link to={`/proyek/${p.id}`} className="text-sm text-slate-100 hover:text-cyan-300 font-medium leading-snug">
                        {p.name}
                      </Link>
                      <Badge variant="outline" className={`${statusById(st).chip} text-[10px] shrink-0`}>{statusById(st).label}</Badge>
                    </div>
                    <div className="mt-1.5 text-[11px] text-slate-400 mono flex items-center gap-2">
                      <span>{sectorById(p.sector_id).short}</span>
                      <span>•</span>
                      <span>{formatIDR(p.budget)}</span>
                    </div>
                    <div className="mt-2">
                      <Progress value={p.progress_pct || 0} className="h-1 bg-slate-800" />
                      <div className="text-[10px] mono text-slate-500 mt-1">
                        Progres {p.progress_pct || 0}% • diperbarui {formatDateID(p.updated_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {updates.length > 0 && (
          <section className="px-5 py-4 border-t border-slate-800">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">Kabar Lapangan Terbaru</div>
            <ul className="space-y-2">
              {updates.slice(0, 4).map((u) => (
                <li key={u.id} className="text-sm">
                  <Link to="/kabar-lapangan" className="text-slate-100 hover:text-cyan-300 leading-snug">{u.title}</Link>
                  <div className="text-[10px] mono text-slate-500">{formatDateID(u.date)}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {kec && (
          <div className="px-5 pb-6 pt-2 border-t border-slate-800">
            <Link
              to={`/wilayah/${kec.id}`}
              className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
              data-testid="link-kecamatan-detail"
            >
              Lihat halaman detail kecamatan <ExternalLink size={13} />
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
