import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { publicAxios } from "@/lib/api";
import { useAdminApi, errMsg } from "./useAdminApi";

export default function AdminSettings() {
  const api = useAdminApi();
  const { data } = useQuery({ queryKey: ["settings"], queryFn: async () => (await publicAxios.get("/public/settings")).data });
  const [form, setForm] = useState({ pemkab_complaint_url: "", pemkab_complaint_label: "", methodology: "" });
  useEffect(() => {
    if (data) setForm({ pemkab_complaint_url: data.pemkab_complaint_url || "", pemkab_complaint_label: data.pemkab_complaint_label || "", methodology: data.methodology || "" });
  }, [data]);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const save = async () => {
    try { await api.put("/admin/settings", form); toast.success("Pengaturan tersimpan"); } catch (e) { toast.error(errMsg(e)); }
  };
  return (
    <div className="max-w-2xl" data-testid="admin-page-settings">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Pengaturan</h1>
      <div className="grid gap-5 mt-6">
        <div><Label className="text-xs text-slate-400">Link kanal pengaduan resmi Pemkab</Label><Input className="mt-1.5 bg-slate-900 border-slate-700" value={form.pemkab_complaint_url} onChange={set("pemkab_complaint_url")} data-testid="settings-complaint-url" /></div>
        <div><Label className="text-xs text-slate-400">Label tombol pengaduan</Label><Input className="mt-1.5 bg-slate-900 border-slate-700" value={form.pemkab_complaint_label} onChange={set("pemkab_complaint_label")} data-testid="settings-complaint-label" /></div>
        <div><Label className="text-xs text-slate-400">Metodologi data (tampil di Data & Laporan)</Label><Textarea rows={6} className="mt-1.5 bg-slate-900 border-slate-700" value={form.methodology} onChange={set("methodology")} data-testid="settings-methodology" /></div>
        <Button onClick={save} className="w-fit bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 hover:brightness-110 text-white" data-testid="settings-save-btn">Simpan pengaturan</Button>
      </div>
    </div>
  );
}
