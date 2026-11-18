import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { MapPin, AlertTriangle } from "lucide-react";

export default function Wilayah() {
  const { data: kecamatan = [] } = useQuery({
    queryKey: ["public", "kecamatan"],
    queryFn: () => publicAxios.get("/public/kecamatan").then((r) => r.data),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: () => publicAxios.get("/public/projects").then((r) => r.data),
  });
  const [q, setQ] = useState("");

  const counts = {};
  projects.forEach((p) => (counts[p.kecamatan_id] = (counts[p.kecamatan_id] || 0) + 1));

  const filtered = kecamatan.filter((k) => k.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 py-10">
        <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Wilayah</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">29 Kecamatan Kabupaten Tangerang</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Pilih kecamatan untuk melihat ringkasan 8 sektor dan proyek yang sedang berjalan di sana.
        </p>
        <div className="mt-6 max-w-sm">
          <Input
            data-testid="wilayah-search"
            placeholder="Cari kecamatan…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-slate-900 border-slate-800 text-slate-100"
          />
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((k) => (
            <Link
              key={k.id}
              to={`/wilayah/${k.id}`}
              data-testid={`wilayah-card-${k.id}`}
              className="rounded-xl bg-slate-900 border border-slate-800 p-4 hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-cyan-400" />
                <span className="text-slate-50 font-semibold">{k.name}</span>
                {k.is_approximate && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] mono text-amber-400"><AlertTriangle size={10} /> approx</span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] mono text-slate-500 mt-2">
                <span>{counts[k.id] || 0} proyek tayang</span>
                <span>{k.latitude.toFixed(2)}, {k.longitude.toFixed(2)}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
