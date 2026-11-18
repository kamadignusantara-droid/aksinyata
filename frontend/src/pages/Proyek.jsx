import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SECTORS, STATUS_LIST, sectorById, statusById, formatIDR } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useMemo, useState } from "react";

export default function Proyek() {
  const { data: projects = [] } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: () => publicAxios.get("/public/projects").then((r) => r.data),
  });
  const { data: kecamatan = [] } = useQuery({
    queryKey: ["public", "kecamatan"],
    queryFn: () => publicAxios.get("/public/kecamatan").then((r) => r.data),
  });

  const [q, setQ] = useState("");
  const [sector, setSector] = useState("all");
  const [status, setStatus] = useState("all");
  const [kec, setKec] = useState("all");
  const [year, setYear] = useState("all");

  const years = useMemo(() => Array.from(new Set(projects.map((p) => p.year).filter(Boolean))).sort((a, b) => b - a), [projects]);

  const filtered = projects.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (sector !== "all" && p.sector_id !== sector) return false;
    if (status !== "all" && p.status !== status) return false;
    if (kec !== "all" && p.kecamatan_id !== kec) return false;
    if (year !== "all" && String(p.year) !== year) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[1300px] mx-auto px-6 py-10">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Daftar Proyek</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Semua Proyek Tayang</h1>
        <p className="text-slate-400 mt-2">Saring menurut sektor, kecamatan, status, dan tahun.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-5">
          <Input
            data-testid="proyek-search"
            placeholder="Cari nama proyek…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="bg-slate-900 border-slate-800 text-slate-100 sm:col-span-2"
          />
          <Select value={sector} onValueChange={setSector}>
            <SelectTrigger data-testid="filter-sector" className="bg-slate-900 border-slate-800 text-slate-100"><SelectValue placeholder="Sektor" /></SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
              <SelectItem value="all">Semua sektor</SelectItem>
              {SECTORS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger data-testid="filter-status" className="bg-slate-900 border-slate-800 text-slate-100"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
              <SelectItem value="all">Semua status</SelectItem>
              {STATUS_LIST.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={kec} onValueChange={setKec}>
            <SelectTrigger data-testid="filter-kecamatan" className="bg-slate-900 border-slate-800 text-slate-100"><SelectValue placeholder="Kecamatan" /></SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100 max-h-72">
              <SelectItem value="all">Semua kecamatan</SelectItem>
              {kecamatan.map((k) => <SelectItem key={k.id} value={k.id}>{k.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger data-testid="filter-year" className="bg-slate-900 border-slate-800 text-slate-100"><SelectValue placeholder="Tahun" /></SelectTrigger>
            <SelectContent className="bg-slate-950 border-slate-800 text-slate-100">
              <SelectItem value="all">Semua tahun</SelectItem>
              {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-slate-400 mono">{filtered.length} proyek</div>
        <ul className="mt-3 grid gap-2">
          {filtered.map((p) => {
            const s = statusById(p.status);
            return (
              <li key={p.id} data-testid={`proyek-row-${p.id}`} className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <Link to={`/proyek/${p.id}`} className="text-slate-100 font-medium hover:text-teal-300">{p.name}</Link>
                  <div className="mt-1 text-[11px] mono text-slate-500">
                    {sectorById(p.sector_id).short} • {p.kecamatan_name || p.kecamatan_id} • {formatIDR(p.budget)} • {p.year || "-"}
                  </div>
                  <Progress value={p.progress_pct || 0} className="h-1 mt-2 bg-slate-800 max-w-md" />
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge variant="outline" className={`${s.chip} text-[11px]`}>{s.label}</Badge>
                  <span className="text-[10px] mono text-slate-500">{p.progress_pct || 0}%</span>
                </div>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-10 text-center text-sm text-slate-500">Tidak ada proyek sesuai filter.</div>
          )}
        </ul>
      </main>
      <Footer />
    </div>
  );
}
