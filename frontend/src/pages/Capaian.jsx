import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import { SECTORS, formatDateID } from "@/lib/constants";
import { Progress } from "@/components/ui/progress";

export default function Capaian() {
  const { data: indicators = [] } = useQuery({
    queryKey: ["public", "indicators"],
    queryFn: () => publicAxios.get("/public/indicators").then((r) => r.data),
  });
  const bySector = {};
  indicators.forEach((i) => {
    (bySector[i.sector_id] = bySector[i.sector_id] || []).push(i);
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Capaian & Target</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Target vs Realisasi</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Perbandingan nilai realisasi dengan target per sektor. Setiap angka mencantumkan tanggal data.
        </p>
        <div className="mt-8 grid gap-6">
          {SECTORS.map((s) => {
            const items = bySector[s.id] || [];
            if (items.length === 0) return null;
            return (
              <section key={s.id} className="rounded-xl bg-slate-900 border border-slate-800 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  <h2 className="text-slate-50 font-semibold">{s.name}</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {items.map((i) => {
                    const pct = i.target > 0 ? Math.round((i.realisasi / i.target) * 100) : 0;
                    return (
                      <div key={i.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm text-slate-200">{i.label}</div>
                          <div className="mono text-xs text-slate-400">{pct}%</div>
                        </div>
                        <Progress value={Math.min(100, pct)} className="h-1.5 mt-2 bg-slate-800" />
                        <div className="mt-1.5 flex items-center justify-between text-[10px] mono text-slate-500">
                          <span>Realisasi {i.realisasi.toLocaleString("id-ID")} / Target {i.target.toLocaleString("id-ID")} {i.unit}</span>
                          <span>{formatDateID(i.data_date)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
          {indicators.length === 0 && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-10 text-center text-sm text-slate-500">
              Belum ada indikator Tayang.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
