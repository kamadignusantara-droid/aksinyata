import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminApi, errMsg } from "./useAdminApi";

const HEADER = "name,sector_id,kecamatan_id,kecamatan_name,status,progress_pct,latitude,longitude,year,budget,funding_source,opd,address,description,benefit,start_date,target_end_date,verification_status";
const SAMPLE = "Contoh Proyek Jalan,infrastruktur,balaraja,Balaraja,berjalan,50,-6.2003,106.4542,2025,1500000000,APBD,Dinas PUPR,Jl. Raya Balaraja,Deskripsi singkat,Manfaat untuk warga,2025-01-10,2025-12-20,draft";

export default function CsvImport() {
  const api = useAdminApi();
  const qc = useQueryClient();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const template = () => {
    const url = URL.createObjectURL(new Blob([`${HEADER}\n${SAMPLE}\n`], { type: "text/csv" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: "template_proyek.csv" });
    a.click();
    URL.revokeObjectURL(url);
  };

  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/projects/import-csv", fd);
      toast.success(`${data.imported} proyek diimpor (status Draft bila tidak diisi)`);
      if (data.errors?.length) toast.error(`${data.errors.length} baris gagal: ${data.errors.slice(0, 3).map((e) => `baris ${e.row}`).join(", ")}`);
      qc.invalidateQueries({ queryKey: ["admin"] });
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
      ref.current.value = "";
    }
  };

  return (
    <>
      <Button variant="ghost" onClick={template} className="text-slate-300" data-testid="csv-template-btn"><Download size={16} className="mr-1" /> Template CSV</Button>
      <Button variant="outline" disabled={busy} onClick={() => ref.current.click()} className="border-slate-700" data-testid="csv-import-btn"><Upload size={16} className="mr-1" /> {busy ? "Mengimpor..." : "Impor CSV"}</Button>
      <input ref={ref} type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => upload(e.target.files?.[0])} data-testid="csv-import-input" />
    </>
  );
}
