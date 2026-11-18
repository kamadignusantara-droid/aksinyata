import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { VERIFICATION_LIST, verifById } from "@/lib/constants";
import { FieldInput, useKecamatan } from "./FieldInput";
import { useAdminApi, errMsg } from "./useAdminApi";

const NEXT = { draft: "sudah_dicek_opd", sudah_dicek_opd: "tayang" };

const toPayload = (fields, form, kec) => {
  const out = { ...form };
  fields.forEach((f) => {
    if (f.type === "number") {
      const v = out[f.key];
      out[f.key] = v === "" || v === null || v === undefined ? (f.empty ?? null) : Number(v);
    }
  });
  if ("kecamatan_name" in out || fields.some((f) => f.key === "kecamatan_id")) {
    const k = kec.find((x) => x.id === out.kecamatan_id);
    if (k) out.kecamatan_name = k.name;
  }
  return out;
};

const FormDialog = ({ open, onClose, fields, initial, onSave, title }) => {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    const missing = fields.filter((f) => f.required && (form[f.key] === "" || form[f.key] === undefined || form[f.key] === null));
    if (missing.length) return toast.error(`Wajib diisi: ${missing.map((m) => m.label).join(", ")}`);
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-slate-950 border-slate-800 text-slate-100 max-h-[90vh] overflow-y-auto" data-testid="crud-form-dialog">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key} className={f.wide || ["textarea", "image"].includes(f.type) ? "sm:col-span-2" : ""}>
              <Label className="text-xs text-slate-400">{f.label}{f.required && <span className="text-rose-400"> *</span>}</Label>
              <div className="mt-1.5"><FieldInput field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} /></div>
            </div>
          ))}
          <DialogFooter className="sm:col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose} data-testid="crud-form-cancel">Batal</Button>
            <Button type="submit" disabled={saving} className="bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 hover:brightness-110 text-white" data-testid="crud-form-submit">{saving ? "Menyimpan..." : "Simpan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const VerifChip = ({ id }) => {
  const v = verifById(id);
  return <span className={`inline-block whitespace-nowrap px-2 py-0.5 rounded border text-xs ${v.chip}`}>{v.label}</span>;
};

export default function CrudPage({ title, subtitle, resource, fields, columns, emptyItem, toolbar, singular }) {
  const api = useAdminApi();
  const qc = useQueryClient();
  const { data: kec = [] } = useKecamatan();
  const key = ["admin", resource];
  const { data = [], isLoading } = useQuery({ queryKey: key, queryFn: async () => (await api.get(`/admin/${resource}`)).data });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [q, setQ] = useState("");
  const [vf, setVf] = useState("all");

  const rows = useMemo(() => data.filter((r) =>
    (vf === "all" || r.verification_status === vf) &&
    JSON.stringify([r.name, r.title, r.label, r.kecamatan_name]).toLowerCase().includes(q.toLowerCase())
  ), [data, q, vf]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin"] });

  const save = async (form) => {
    try {
      const body = toPayload(fields, form, kec);
      if (form.id) await api.put(`/admin/${resource}/${form.id}`, body);
      else await api.post(`/admin/${resource}`, body);
      toast.success("Tersimpan");
      setEditing(null);
      refresh();
    } catch (e) {
      const d = e?.response?.data?.detail;
      toast.error(Array.isArray(d) ? `Data tidak valid: ${d.map((x) => x.loc?.slice(-1)[0]).join(", ")}` : errMsg(e));
    }
  };

  const advance = async (row) => {
    try {
      await api.put(`/admin/${resource}/${row.id}`, { ...row, verification_status: NEXT[row.verification_status] });
      toast.success(`Status: ${verifById(NEXT[row.verification_status]).label}`);
      refresh();
    } catch (e) { toast.error(errMsg(e)); }
  };

  const remove = async () => {
    try {
      await api.delete(`/admin/${resource}/${deleting.id}`);
      toast.success("Dihapus");
      setDeleting(null);
      refresh();
    } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <div data-testid={`admin-page-${resource}`}>
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {toolbar}
          <Button onClick={() => setEditing({ ...emptyItem })} className="bg-gradient-to-r from-violet-600 via-blue-600 to-teal-500 hover:brightness-110 text-white" data-testid={`add-${resource}-btn`}><Plus size={16} className="mr-1" /> Tambah {singular}</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari..." className="pl-8 bg-slate-900 border-slate-700" data-testid="crud-search-input" />
        </div>
        {[{ id: "all", label: "Semua" }, ...VERIFICATION_LIST].map((v) => (
          <button key={v.id} onClick={() => setVf(v.id)} data-testid={`crud-filter-${v.id}`}
            className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${vf === v.id ? "border-violet-500/60 text-teal-300 bg-violet-500/15" : "border-slate-700 text-slate-400 hover:text-slate-200"}`}>
            {v.label} <span className="mono ml-1 opacity-70">{v.id === "all" ? data.length : data.filter((d) => d.verification_status === v.id).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 overflow-x-auto">
        <table className="w-full text-sm" data-testid={`crud-table-${resource}`}>
          <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider">
            <tr>
              {columns.map((c) => <th key={c.key} className="text-left px-4 py-3 font-medium whitespace-nowrap">{c.label}</th>)}
              <th className="text-left px-4 py-3 font-medium">Verifikasi</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading && <tr><td colSpan={columns.length + 2} className="px-4 py-8 text-center text-slate-500">Memuat...</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={columns.length + 2} className="px-4 py-8 text-center text-slate-500" data-testid="crud-empty">Belum ada data.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-900/50" data-testid={`crud-row-${r.id}`}>
                {columns.map((c) => <td key={c.key} className="px-4 py-3 text-slate-200 align-top">{c.render ? c.render(r) : r[c.key]}</td>)}
                <td className="px-4 py-3 align-top"><VerifChip id={r.verification_status} /></td>
                <td className="px-4 py-3 align-top">
                  <div className="flex items-center gap-1 justify-end">
                    {NEXT[r.verification_status] && (
                      <Button size="sm" variant="outline" onClick={() => advance(r)} className="h-8 text-xs border-slate-700 whitespace-nowrap" data-testid={`advance-${r.id}`}>
                        {r.verification_status === "draft" ? "Tandai dicek OPD" : "Tayangkan"} <ChevronRight size={14} />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing({ ...r })} data-testid={`edit-${r.id}`}><Pencil size={14} /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-300" onClick={() => setDeleting(r)} data-testid={`delete-${r.id}`}><Trash2 size={14} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <FormDialog open title={editing.id ? `Ubah ${singular}` : `Tambah ${singular}`} fields={fields} initial={editing} onClose={() => setEditing(null)} onSave={save} />}

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {singular}?</AlertDialogTitle>
            <AlertDialogDescription>"{deleting?.name || deleting?.title || deleting?.label}" akan dihapus permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="delete-cancel">Batal</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-rose-600 hover:bg-rose-500" data-testid="delete-confirm">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
