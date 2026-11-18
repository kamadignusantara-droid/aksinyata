import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";

export default function DataLaporan() {
  const { data: settings } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: () => publicAxios.get("/public/settings").then((r) => r.data),
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Data & Laporan</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Data Terbuka</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Unduh daftar lengkap proyek yang sudah Tayang beserta kolom-kolom data terstruktur.
        </p>
        <div className="mt-8 rounded-xl bg-slate-900 border border-slate-800 p-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-50 font-semibold">
              <FileText size={16} className="text-teal-400" /> Proyek Tayang (CSV)
            </div>
            <p className="text-sm text-slate-400 mt-1.5">
              Format CSV UTF-8. Kolom: id, name, sector_id, kecamatan_name, status, progress_pct, latitude, longitude, year, budget, funding_source, opd, start_date, target_end_date, updated_at.
            </p>
          </div>
          <a href={`${API_BASE}/public/data/projects.csv`} download data-testid="download-csv">
            <Button className="bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 hover:brightness-110 text-white font-semibold">
              <Download size={14} className="mr-1.5" /> Unduh CSV
            </Button>
          </a>
        </div>

        <section className="mt-10">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mono mb-2">Metodologi</div>
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 text-sm text-slate-300 leading-relaxed">
            {settings?.methodology || "—"}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
