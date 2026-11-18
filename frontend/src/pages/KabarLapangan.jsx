import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios, absUrl } from "@/lib/api";
import { sectorById, formatDateID } from "@/lib/constants";
import { AlertTriangle } from "lucide-react";

export default function KabarLapangan() {
  const { data: updates = [] } = useQuery({
    queryKey: ["public", "field-updates"],
    queryFn: () => publicAxios.get("/public/field-updates").then((r) => r.data),
  });
  const { data: issues = [] } = useQuery({
    queryKey: ["public", "issues"],
    queryFn: () => publicAxios.get("/public/issues").then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1100px] mx-auto px-6 py-10">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Kabar Lapangan</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Catatan lapangan & Respons Isu</h1>
        <div className="grid gap-6 mt-8 lg:grid-cols-3">
          <section className="lg:col-span-2 space-y-4">
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Catatan Lapangan Terbaru</div>
            {updates.map((u) => {
              const sec = sectorById(u.sector_id);
              return (
                <article key={u.id} data-testid={`kabar-${u.id}`} className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
                  {u.photo_url && (
                    <img src={absUrl(u.photo_url)} alt="" className="w-full aspect-video object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mono" style={{ color: sec.color }}>
                      {sec.short} • {u.kecamatan_id}
                    </div>
                    <h3 className="text-slate-50 font-bold text-lg mt-1">{u.title}</h3>
                    <p className="text-slate-300 mt-2 leading-relaxed">{u.body}</p>
                    <div className="mt-3 text-[11px] mono text-slate-500">{formatDateID(u.date)}</div>
                  </div>
                </article>
              );
            })}
            {updates.length === 0 && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-8 text-sm text-slate-500 text-center">Belum ada kabar lapangan.</div>
            )}
          </section>
          <aside className="space-y-3">
            <div className="text-[10px] uppercase tracking-widest text-red-400 mono flex items-center gap-1.5">
              <AlertTriangle size={11} /> Respons Isu
            </div>
            {issues.map((iss) => (
              <article key={iss.id} className="rounded-xl bg-slate-900 border border-red-500/20 p-4">
                <div className="text-slate-50 font-semibold text-sm">{iss.title}</div>
                <p className="text-slate-300 text-xs mt-1.5">{iss.description}</p>
                {iss.handling_steps && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    <span className="mono text-teal-300">Penanganan:</span> {iss.handling_steps}
                  </div>
                )}
                <div className="mt-2 text-[10px] mono text-slate-500">Status: {iss.status} • {formatDateID(iss.date)}</div>
              </article>
            ))}
            {issues.length === 0 && (
              <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-500 text-center">Belum ada isu dilaporkan.</div>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
