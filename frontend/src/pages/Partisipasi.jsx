import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalLink } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function Partisipasi() {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: "",
    contact: "",
    message: "",
    related_project_id: params.get("project") || "",
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["public", "settings"],
    queryFn: () => publicAxios.get("/public/settings").then((r) => r.data),
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: () => publicAxios.get("/public/projects").then((r) => r.data),
  });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSubmitting(true);
    try {
      await publicAxios.post("/public/feedback", form);
      toast.success("Terima kasih! Masukan Anda sudah tersimpan.");
      setForm({ name: "", contact: "", message: "", related_project_id: "" });
    } catch {
      toast.error("Gagal mengirim. Coba lagi sebentar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="max-w-[900px] mx-auto px-6 py-12">
        <div className="text-[10px] uppercase tracking-widest text-violet-300 mono">Partisipasi Warga</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-50 mt-1">Beri masukan</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">
          Tulis apa yang Anda lihat di lapangan, saran, atau pertanyaan. Nama tidak wajib. Masukan ini masuk ke tim AKSINYATA untuk ditindaklanjuti bersama OPD.
        </p>

        <form onSubmit={submit} className="mt-8 grid gap-4 rounded-xl bg-slate-900 border border-slate-800 p-6">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-slate-300">Nama (opsional)</Label>
            <Input
              id="name"
              data-testid="feedback-name-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contact" className="text-slate-300">Kontak (opsional, agar bisa dihubungi balik)</Label>
            <Input
              id="contact"
              data-testid="feedback-contact-input"
              placeholder="email / nomor HP"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="project" className="text-slate-300">Proyek terkait (opsional)</Label>
            <select
              id="project"
              data-testid="feedback-project-select"
              value={form.related_project_id}
              onChange={(e) => setForm({ ...form, related_project_id: e.target.value })}
              className="bg-slate-950 border border-slate-800 text-slate-100 rounded-md px-3 py-2 text-sm"
            >
              <option value="">— Tidak terkait proyek tertentu —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="message" className="text-slate-300">Masukan Anda *</Label>
            <Textarea
              id="message"
              data-testid="feedback-message-input"
              rows={5}
              required
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="bg-slate-950 border-slate-800 text-slate-100"
            />
          </div>
          <div>
            <Button
              type="submit"
              disabled={submitting}
              data-testid="feedback-form-submit-button"
              className="bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 hover:brightness-110 text-white font-semibold"
            >
              {submitting ? "Mengirim…" : "Kirim Masukan"}
            </Button>
          </div>
        </form>

        {settings?.pemkab_complaint_url && (
          <div className="mt-6 rounded-xl bg-slate-900 border border-slate-800 p-5 text-sm">
            <div className="text-slate-300">{settings.pemkab_complaint_label || "Kanal pengaduan resmi"}</div>
            <a href={settings.pemkab_complaint_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-teal-300 hover:text-teal-300 mt-1">
              {settings.pemkab_complaint_url} <ExternalLink size={13} />
            </a>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
