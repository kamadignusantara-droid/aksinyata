import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950" data-testid="site-footer">
      <div className="max-w-[1480px] mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 grid place-items-center">
              <span className="text-cyan-300 font-black text-sm">A</span>
            </div>
            <span className="text-slate-50 font-bold tracking-tight">AKSINYATA</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Portal transparansi pembangunan Kabupaten Tangerang. Setiap angka selalu disertai tanggal data.
          </p>
        </div>
        <div>
          <div className="text-slate-50 font-semibold mb-3">Jelajahi</div>
          <ul className="space-y-1.5 text-slate-400">
            <li><Link to="/" className="hover:text-cyan-300">Peta Beranda</Link></li>
            <li><Link to="/sektor" className="hover:text-cyan-300">Sektor</Link></li>
            <li><Link to="/wilayah" className="hover:text-cyan-300">29 Kecamatan</Link></li>
            <li><Link to="/proyek" className="hover:text-cyan-300">Daftar Proyek</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-slate-50 font-semibold mb-3">Partisipasi</div>
          <ul className="space-y-1.5 text-slate-400">
            <li><Link to="/kabar-lapangan" className="hover:text-cyan-300">Kabar Lapangan</Link></li>
            <li><Link to="/data-laporan" className="hover:text-cyan-300">Data & Laporan</Link></li>
            <li><Link to="/partisipasi" className="hover:text-cyan-300">Kirim Masukan</Link></li>
            <li><Link to="/tentang" className="hover:text-cyan-300">Cara Baca Peta</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-slate-50 font-semibold mb-3">Catatan</div>
          <p className="text-slate-400 leading-relaxed">
            Beberapa data awal adalah contoh (ditandai <span className="mono text-cyan-300">[CONTOH]</span>) dan akan diganti data OPD terverifikasi.
          </p>
        </div>
      </div>
      <div className="border-t border-slate-800/80 px-6 py-4 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} AKSINYATA — Transparansi Pembangunan Kabupaten Tangerang
      </div>
    </footer>
  );
}
