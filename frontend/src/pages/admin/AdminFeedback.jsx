import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDateID } from "@/lib/constants";
import { useAdminApi, errMsg } from "./useAdminApi";

const STATUSES = [
  { id: "baru", label: "Baru", chip: "bg-amber-950/60 text-amber-300 border-amber-500/40" },
  { id: "ditindaklanjuti", label: "Ditindaklanjuti", chip: "bg-indigo-950 text-indigo-300 border-indigo-700" },
  { id: "selesai", label: "Selesai", chip: "bg-emerald-950 text-emerald-300 border-emerald-600" },
];

const FeedbackCard = ({ f, onUpdate, onDelete }) => {
  const [note, setNote] = useState(f.admin_note || "");
  const status = f.status || "baru";
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5" data-testid={`feedback-${f.id}`}>
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="text-sm text-slate-300"><b className="text-slate-100">{f.name || "Anonim"}</b>{f.contact && <span className="text-slate-500"> · {f.contact}</span>}</div>
        <span className="text-xs text-slate-500 mono">{formatDateID(f.created_at)}</span>
      </div>
      <p className="text-slate-200 mt-3 whitespace-pre-line">{f.message}</p>
      {f.related_project_id && <div className="text-xs text-slate-500 mt-2 mono">Proyek terkait: {f.related_project_id}</div>}
      <Textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Catatan tindak lanjut (internal)" className="mt-4 bg-slate-950 border-slate-700 text-sm" data-testid={`feedback-note-${f.id}`} />
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {STATUSES.map((s) => (
          <button key={s.id} onClick={() => onUpdate(f.id, s.id, note)} data-testid={`feedback-status-${f.id}-${s.id}`}
            className={`px-2.5 py-1 rounded border text-xs transition-opacity ${s.chip} ${status === s.id ? "ring-1 ring-offset-1 ring-offset-slate-900 ring-current" : "opacity-50 hover:opacity-100"}`}>
            {s.label}
          </button>
        ))}
        {note !== (f.admin_note || "") && (
          <Button size="sm" variant="outline" className="h-7 text-xs border-slate-700" onClick={() => onUpdate(f.id, status, note)} data-testid={`feedback-save-note-${f.id}`}>Simpan catatan</Button>
        )}
        <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 text-rose-300" onClick={() => onDelete(f.id)} data-testid={`feedback-delete-${f.id}`}><Trash2 size={14} /></Button>
      </div>
    </div>
  );
};

export default function AdminFeedback() {
  const api = useAdminApi();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("baru");
  const { data = [], isLoading } = useQuery({ queryKey: ["admin", "feedback"], queryFn: async () => (await api.get("/admin/feedback")).data });
  const rows = data.filter((f) => filter === "all" || (f.status || "baru") === filter);

  const run = async (fn, msg) => {
    try { await fn(); toast.success(msg); qc.invalidateQueries({ queryKey: ["admin", "feedback"] }); } catch (e) { toast.error(errMsg(e)); }
  };
  const onUpdate = (id, status, admin_note) => run(() => api.put(`/admin/feedback/${id}`, { status, admin_note }), "Masukan diperbarui");
  const onDelete = (id) => window.confirm("Hapus masukan ini?") && run(() => api.delete(`/admin/feedback/${id}`), "Masukan dihapus");

  return (
    <div data-testid="admin-page-feedback">
      <h1 className="text-2xl sm:text-3xl font-bold text-slate-50">Masukan Warga</h1>
      <p className="text-sm text-slate-400 mt-1">Pesan dari formulir Partisipasi Warga. Tidak ditampilkan ke publik.</p>
      <div className="flex flex-wrap gap-2 mt-6">
        {[...STATUSES, { id: "all", label: "Semua" }].map((s) => (
          <button key={s.id} onClick={() => setFilter(s.id)} data-testid={`feedback-filter-${s.id}`}
            className={`px-3 py-1.5 rounded-md text-xs border ${filter === s.id ? "border-violet-500/60 text-teal-300 bg-violet-500/15" : "border-slate-700 text-slate-400"}`}>
            {s.label} <span className="mono opacity-70 ml-1">{s.id === "all" ? data.length : data.filter((f) => (f.status || "baru") === s.id).length}</span>
          </button>
        ))}
      </div>
      <div className="grid gap-4 mt-5 lg:grid-cols-2">
        {isLoading && <p className="text-slate-500 text-sm">Memuat...</p>}
        {!isLoading && rows.length === 0 && <p className="text-slate-500 text-sm" data-testid="feedback-empty">Tidak ada masukan di kategori ini.</p>}
        {rows.map((f) => <FeedbackCard key={`${f.id}-${f.status}-${f.admin_note}`} f={f} onUpdate={onUpdate} onDelete={onDelete} />)}
      </div>
    </div>
  );
}
