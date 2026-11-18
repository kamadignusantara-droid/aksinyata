import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { STATUS_LIST } from "@/lib/constants";

export default function Tentang() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Tentang AKSINYATA</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Melihat pembangunan sebagaimana adanya</h1>
        <p className="text-slate-300 mt-4 leading-relaxed">
          AKSINYATA adalah portal transparansi pembangunan Kabupaten Tangerang. Tujuannya satu: siapa pun — warga, jurnalis, mahasiswa — bisa melihat apa yang sedang dikerjakan Pemkab Tangerang, di mana, sampai mana kemajuannya, dan apa manfaatnya untuk warga.
        </p>
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-50">Cara baca peta</h2>
          <p className="text-slate-400 mt-2">Setiap titik di peta adalah proyek. Warnanya menandakan status:</p>
          <div className="grid gap-3 sm:grid-cols-3 mt-4">
            {STATUS_LIST.map((s) => (
              <div key={s.id} className="rounded-lg bg-slate-900 border border-slate-800 p-4 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{ background: s.hex }} />
                <div>
                  <div className="text-slate-50 font-semibold">{s.label}</div>
                  <div className="text-xs text-slate-400">
                    {s.id === "rencana" && "Belum mulai, masih tahap perencanaan atau lelang."}
                    {s.id === "berjalan" && "Pekerjaan sedang berlangsung di lapangan."}
                    {s.id === "selesai" && "Pekerjaan sudah tuntas dan diserahterimakan."}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <ul className="mt-6 text-slate-300 space-y-2 list-disc pl-5">
            <li>Lingkaran merah dengan tanda seru adalah <strong>Respons Isu</strong> — laporan atau keluhan yang sedang ditangani.</li>
            <li>Klik titik abu-abu kecil di tengah kecamatan untuk membuka panel kecamatan dengan ringkasan 8 sektor.</li>
            <li>Gunakan tombol di pojok untuk mengganti tampilan 3D ↔ 2D.</li>
          </ul>
        </section>
        <section className="mt-10">
          <h2 className="text-xl font-semibold text-slate-50">Glossarium singkat</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2 text-sm">
            <Row term="OPD" def="Organisasi Perangkat Daerah — dinas atau badan pemerintah daerah." />
            <Row term="APBD" def="Anggaran Pendapatan dan Belanja Daerah." />
            <Row term="DAK" def="Dana Alokasi Khusus — transfer dari pusat untuk urusan tertentu." />
            <Row term="RPJMD" def="Rencana Pembangunan Jangka Menengah Daerah, 5 tahunan." />
            <Row term="Centroid" def="Titik tengah suatu wilayah; dipakai sebagai perkiraan posisi kecamatan." />
            <Row term="GeoJSON" def="Format data untuk batas wilayah di peta." />
          </dl>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Row({ term, def }) {
  return (
    <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
      <dt className="text-violet-300 mono text-xs uppercase tracking-widest">{term}</dt>
      <dd className="text-slate-300 mt-1">{def}</dd>
    </div>
  );
}
