import { Progress } from "@/components/ui/progress";
import { formatDateID } from "@/lib/constants";

export default function HudStrip({ stats, tilt, setTilt }) {
  if (!stats) stats = { total: 0, rencana: 0, berjalan: 0, selesai: 0, percent_selesai: 0, kecamatan_covered: 0, kecamatan_total: 29, last_updated: null };
  return (
    <div
      data-testid="hud-top-strip"
      className="hud-strong fixed top-16 left-3 right-3 lg:left-6 lg:right-6 z-20 rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-slate-100 shadow-2xl"
    >
      <div className="sm:flex-1 min-w-[70px]">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Total Proyek</div>
        <div data-testid="hud-total-projects-metric" className="mono font-bold text-xl sm:text-2xl text-cyan-300 leading-none mt-0.5">
          {stats.total}
        </div>
      </div>
      <div className="flex-1 min-w-[160px]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 mono">Selesai</span>
          <span data-testid="hud-completed-percentage" className="mono text-xs font-semibold text-emerald-400">{stats.percent_selesai}%</span>
        </div>
        <Progress value={stats.percent_selesai} className="h-1.5 mt-1 bg-slate-800" />
      </div>
      <div className="flex items-center gap-3 order-last sm:order-none w-full sm:w-auto">
        <StatusChip label="Rencana" count={stats.rencana} hex="#64748B" />
        <StatusChip label="Berjalan" count={stats.berjalan} hex="#F59E0B" />
        <StatusChip label="Selesai" count={stats.selesai} hex="#10B981" />
      </div>
      <div className="hidden sm:block min-w-[120px]">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Kecamatan</div>
        <div className="mono font-bold text-base text-slate-100 leading-none mt-0.5">
          {stats.kecamatan_covered}
          <span className="text-slate-500">/{stats.kecamatan_total}</span>
        </div>
      </div>
      <div className="hidden sm:block min-w-[140px]">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Terakhir diperbarui</div>
        <div className="text-sm text-slate-200 mt-0.5">{formatDateID(stats.last_updated)}</div>
      </div>
      <button
        data-testid="toggle-2d-3d"
        onClick={() => setTilt(!tilt)}
        className="text-[11px] mono px-2.5 py-1.5 rounded-md border border-slate-700 bg-slate-900/70 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
        title="Alih tampilan datar / miring 3D"
      >
        {tilt ? "3D" : "2D"} · ganti
      </button>
    </div>
  );
}

function StatusChip({ label, count, hex }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: hex }} />
      <span className="text-[11px] uppercase tracking-wide text-slate-400 mono">{label}</span>
      <span className="mono font-semibold text-slate-100">{count}</span>
    </div>
  );
}
