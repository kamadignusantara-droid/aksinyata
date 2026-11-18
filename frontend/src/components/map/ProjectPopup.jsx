import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { statusById, sectorById, formatDateID, formatIDR } from "@/lib/constants";
import { MapPin, ExternalLink, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { absUrl } from "@/lib/api";

export default function ProjectPopup({ open, onOpenChange, project }) {
  const [show, setShow] = useState("after");
  if (!project) return null;
  if (project._isIssue) return <IssueDialog open={open} onOpenChange={onOpenChange} issue={project} />;

  const s = statusById(project.status);
  const sec = sectorById(project.sector_id);
  const photo = show === "before" ? project.before_photo_url : project.after_photo_url;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="project-popup-card"
        className="bg-slate-950 border border-slate-800 text-slate-100 max-w-md p-0 overflow-hidden rounded-xl"
      >
        <DialogHeader className="px-5 pt-5 pb-2">
          <div className="text-[10px] uppercase tracking-widest mono mb-1" style={{ color: sec.color }}>
            {sec.name}
          </div>
          <DialogTitle className="text-slate-50 text-lg font-bold leading-tight pr-6">
            {project.name}
          </DialogTitle>
          <div className="flex items-center gap-2 text-[11px] mono text-slate-400 mt-1">
            <MapPin size={11} /> {project.kecamatan_name || project.kecamatan_id}
          </div>
        </DialogHeader>

        {photo && (
          <div className="px-5">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 aspect-video bg-slate-900">
              <img src={absUrl(photo)} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 text-[10px] mono uppercase tracking-widest px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300">
                {show === "before" ? "Sebelum" : "Sesudah"}
              </div>
            </div>
            {project.before_photo_url && project.after_photo_url && (
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShow("before")}
                  data-testid="popup-photo-before"
                  className={`flex-1 text-xs py-1.5 rounded-md border ${show === "before" ? "bg-slate-800 border-cyan-500/40 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  Sebelum
                </button>
                <button
                  onClick={() => setShow("after")}
                  data-testid="popup-photo-after"
                  className={`flex-1 text-xs py-1.5 rounded-md border ${show === "after" ? "bg-slate-800 border-cyan-500/40 text-cyan-300" : "bg-slate-900 border-slate-800 text-slate-400"}`}
                >
                  Sesudah
                </button>
              </div>
            )}
          </div>
        )}

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" data-testid="project-status-badge" className={`${s.chip} text-[11px]`}>
              {s.label}
            </Badge>
            <span className="text-[11px] mono text-slate-500">
              Diperbarui {formatDateID(project.updated_at)}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11px] mono mb-1">
              <span className="text-slate-400 uppercase tracking-widest">Progres</span>
              <span className="text-slate-100 font-semibold">{project.progress_pct || 0}%</span>
            </div>
            <Progress value={project.progress_pct || 0} className="h-1.5 bg-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mono">Anggaran</div>
              <div className="text-slate-100 mono mt-0.5">{formatIDR(project.budget)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 mono">OPD</div>
              <div className="text-slate-100 mt-0.5">{project.opd || "-"}</div>
            </div>
          </div>
          {project.benefit && (
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-sm text-slate-300 leading-relaxed">
              <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono mb-1">Manfaat Warga</div>
              {project.benefit}
            </div>
          )}
          <Link
            to={`/proyek/${project.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200"
            onClick={() => onOpenChange(false)}
            data-testid="popup-detail-link"
          >
            Lihat halaman proyek lengkap <ExternalLink size={13} />
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IssueDialog({ open, onOpenChange, issue }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-950 border border-red-500/30 text-slate-100 max-w-md rounded-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-400 text-[11px] mono uppercase tracking-widest">
            <AlertTriangle size={14} /> Respons Isu
          </div>
          <DialogTitle className="text-slate-50 text-lg font-bold leading-tight">{issue.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p className="text-slate-300">{issue.description}</p>
          {issue.handling_steps && (
            <div className="rounded-lg bg-slate-900 border border-slate-800 p-3">
              <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono mb-1">Langkah Penanganan</div>
              <p className="text-slate-300">{issue.handling_steps}</p>
            </div>
          )}
          <div className="text-[11px] mono text-slate-500">Status: {issue.status} • {formatDateID(issue.date)}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
