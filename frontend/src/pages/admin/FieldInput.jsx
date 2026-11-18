import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SECTORS, VERIFICATION_LIST } from "@/lib/constants";
import { publicAxios, absUrl } from "@/lib/api";
import { useAdminApi, errMsg } from "./useAdminApi";

const useKecamatan = () =>
  useQuery({ queryKey: ["kecamatan"], queryFn: async () => (await publicAxios.get("/public/kecamatan")).data });

const SelectField = ({ value, onChange, options, testId }) => (
  <Select value={value || undefined} onValueChange={onChange}>
    <SelectTrigger className="bg-slate-900 border-slate-700" data-testid={testId}><SelectValue placeholder="Pilih..." /></SelectTrigger>
    <SelectContent className="max-h-72">
      {options.map((o) => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}
    </SelectContent>
  </Select>
);

const ImageField = ({ value, onChange, testId }) => {
  const api = useAdminApi();
  const [busy, setBusy] = useState(false);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd);
      onChange(data.url);
      toast.success("Foto terunggah");
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="flex items-center gap-3">
      {value ? <img src={absUrl(value)} alt="" className="w-20 h-14 object-cover rounded border border-slate-700" data-testid={`${testId}-preview`} /> : <div className="w-20 h-14 rounded border border-dashed border-slate-700 grid place-items-center text-[10px] text-slate-500">Belum ada</div>}
      <div className="flex flex-col gap-1">
        <input type="file" accept="image/*" disabled={busy} onChange={(e) => upload(e.target.files?.[0])} className="text-xs text-slate-400 file:mr-2 file:rounded file:border-0 file:bg-slate-800 file:px-2 file:py-1 file:text-slate-200" data-testid={testId} />
        {busy && <span className="text-xs text-teal-300">Mengunggah...</span>}
        {value && !busy && <button type="button" onClick={() => onChange("")} className="text-xs text-rose-300 text-left" data-testid={`${testId}-remove`}>Hapus foto</button>}
      </div>
    </div>
  );
};

export const FieldInput = ({ field, value, onChange }) => {
  const { data: kec = [] } = useKecamatan();
  const testId = `field-${field.key}`;
  const cls = "bg-slate-900 border-slate-700";
  switch (field.type) {
    case "textarea":
      return <Textarea rows={3} className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testId} />;
    case "sector":
      return <SelectField value={value} onChange={onChange} testId={testId} options={SECTORS.map((s) => ({ id: s.id, label: s.name }))} />;
    case "kecamatan":
      return <SelectField value={value} onChange={onChange} testId={testId} options={kec.map((k) => ({ id: k.id, label: k.name }))} />;
    case "verification":
      return <SelectField value={value} onChange={onChange} testId={testId} options={VERIFICATION_LIST} />;
    case "select":
      return <SelectField value={value} onChange={onChange} testId={testId} options={field.options} />;
    case "image":
      return <ImageField value={value} onChange={onChange} testId={testId} />;
    case "number":
      return <Input type="number" step="any" className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testId} />;
    case "date":
      return <Input type="date" className={cls} value={(value || "").slice(0, 10)} onChange={(e) => onChange(e.target.value)} data-testid={testId} />;
    default:
      return <Input className={cls} value={value ?? ""} onChange={(e) => onChange(e.target.value)} data-testid={testId} />;
  }
};

export { useKecamatan };
