import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="aks-footer bg-gradient-to-b from-[#120c2b] to-[#0b0820]" data-testid="site-footer">
      <div className="max-w-[1480px] mx-auto px-6 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-blue-600 to-teal-500 grid place-items-center">
              <span className="text-white font-black text-sm">A</span>
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-violet-300 via-blue-300 to-teal-300 bg-clip-text text-transparent">AKSINYATA</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Portal transparansi pembangunan Kabupaten Tangerang. Setiap angka selalu disertai tanggal data.
          </p>
        </div>
        <div>
          <div className="text-violet-200 font-semibold mb-3">Jelajahi</div>
          <ul className="space-y-1.5 text-slate-400">
            <li><Link to="/" className="hover:text-teal-300">Peta Beranda</Link></li>
            <li><Link to="/sektor" className="hover:text-teal-300">Sektor</Link></li>
            <li><Link to="/wilayah" className="hover:text-teal-300">29 Kecamatan</Link></li>
            <li><Link to="/proyek" className="hover:text-teal-300">Daftar Proyek</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-violet-200 font-semibold mb-3">Partisipasi</div>
          <ul className="space-y-1.5 text-slate-400">
            <li><Link to="/kabar-lapangan" className="hover:text-teal-300">Kabar Lapangan</Link></li>
            <li><Link to="/data-laporan" className="hover:text-teal-300">Data & Laporan</Link></li>
            <li><Link to="/partisipasi" className="hover:text-teal-300">Kirim Masukan</Link></li>
            <li><Link to="/tentang" className="hover:text-teal-300">Cara Baca Peta</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-violet-200 font-semibold mb-3">Catatan</div>
          <p className="text-slate-400 leading-relaxed">
            Beberapa data awal adalah contoh (ditandai <span className="mono text-teal-300">[CONTOH]</span>) dan akan diganti data OPD terverifikasi.
          </p>
        </div>
      </div>
      <div className="border-t border-violet-500/15 px-6 py-4 text-xs text-slate-500 text-center">
        © {new Date().getFullYear()} AKSINYATA — Transparansi Pembangunan Kabupaten Tangerang
      </div>
    </footer>
  );
}
