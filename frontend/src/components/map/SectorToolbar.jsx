import { SECTORS } from "@/lib/constants";
import * as Icons from "lucide-react";

export default function SectorToolbar({ active, onToggle, onClear }) {
  return (
    <div
      data-testid="sector-toolbar"
      className="hud-strong fixed bottom-3 left-3 right-3 lg:left-6 lg:right-auto lg:bottom-6 z-20 rounded-xl p-2 flex flex-row lg:flex-col gap-1.5 overflow-x-auto scrollbar-slim shadow-2xl"
    >
      <div className="hidden lg:block text-[10px] uppercase tracking-widest text-slate-400 mono px-2 pt-1">
        Lapisan Sektor
      </div>
      {SECTORS.map((s) => {
        const Icon = Icons[s.icon] || Icons.Circle;
        const isOn = active.includes(s.id);
        return (
          <button
            key={s.id}
            data-testid={`sector-toggle-${s.id}`}
            onClick={() => onToggle(s.id)}
            className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-all whitespace-nowrap border ${
              isOn
                ? "bg-slate-800 border-cyan-500/40 text-cyan-300 cyan-glow"
                : "bg-slate-900/40 border-transparent text-slate-300 hover:bg-slate-800/60"
            }`}
            title={s.name}
          >
            <Icon size={14} style={{ color: isOn ? s.color : undefined }} />
            <span className="hidden lg:inline">{s.short}</span>
          </button>
        );
      })}
      {active.length > 0 && (
        <button
          data-testid="sector-clear"
          onClick={onClear}
          className="text-[11px] mono text-slate-400 hover:text-slate-100 px-2 py-1.5 ml-1 lg:ml-0 lg:mt-1"
        >
          Reset
        </button>
      )}
    </div>
  );
}
