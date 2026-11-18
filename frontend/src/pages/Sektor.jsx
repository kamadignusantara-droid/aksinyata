import { Link } from "react-router-dom";
import { SECTORS } from "@/lib/constants";
import * as Icons from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";

export default function Sektor() {
  const { data: projects = [] } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: () => publicAxios.get("/public/projects").then((r) => r.data),
  });
  const counts = {};
  projects.forEach((p) => (counts[p.sector_id] = (counts[p.sector_id] || 0) + 1));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Sektor Pembangunan</div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">
            8 sektor yang dipantau
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl">
            Pembangunan Kabupaten Tangerang bukan hanya soal jalan dan jembatan. Ia menyentuh ekonomi, pangan, pendidikan, kesehatan, perlindungan sosial, lingkungan, dan layanan publik.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SECTORS.map((s) => {
            const Icon = Icons[s.icon] || Icons.Circle;
            return (
              <Link
                key={s.id}
                to={`/sektor/${s.id}`}
                data-testid={`sektor-card-${s.id}`}
                className="rounded-xl bg-slate-900 border border-slate-800 p-5 hover:border-cyan-500/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg grid place-items-center mb-3 border border-slate-700" style={{ background: `${s.color}20`, borderColor: `${s.color}66` }}>
                  <Icon size={18} style={{ color: s.color }} />
                </div>
                <div className="text-slate-50 font-semibold leading-tight">{s.name}</div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 mono">Proyek Tayang</span>
                  <span className="mono font-bold text-cyan-300">{counts[s.id] || 0}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
