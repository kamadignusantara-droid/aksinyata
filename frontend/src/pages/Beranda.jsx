import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicAxios } from "@/lib/api";
import MapView from "@/components/map/MapView";
import HudStrip from "@/components/map/HudStrip";
import SectorToolbar from "@/components/map/SectorToolbar";
import KecamatanPanel from "@/components/map/KecamatanPanel";
import ProjectPopup from "@/components/map/ProjectPopup";
import Navbar from "@/components/layout/Navbar";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search } from "lucide-react";

export default function Beranda() {
  const [active, setActive] = useState([]);
  const [focus, setFocus] = useState(null);
  const [tilt, setTilt] = useState(true);
  const [kecPanel, setKecPanel] = useState({ open: false, data: null });
  const [proj, setProj] = useState({ open: false, project: null });
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["public", "projects"],
    queryFn: () => publicAxios.get("/public/projects").then((r) => r.data),
  });
  const { data: kecamatan = [] } = useQuery({
    queryKey: ["public", "kecamatan"],
    queryFn: () => publicAxios.get("/public/kecamatan").then((r) => r.data),
  });
  const { data: issues = [] } = useQuery({
    queryKey: ["public", "issues"],
    queryFn: () => publicAxios.get("/public/issues").then((r) => r.data),
  });
  const { data: stats } = useQuery({
    queryKey: ["public", "stats"],
    queryFn: () => publicAxios.get("/public/stats").then((r) => r.data),
  });

  const toggleSector = (id) =>
    setActive((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // Auto-detect mobile → default 2D
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setTilt(false);
  }, []);

  const openKec = async (k) => {
    setFocus({ lat: k.latitude, lng: k.longitude, zoom: 13 });
    try {
      const { data } = await publicAxios.get(`/public/kecamatan/${k.id}`);
      setKecPanel({ open: true, data });
    } catch (e) {
      setKecPanel({ open: true, data: { kecamatan: k, projects: [], field_updates: [] } });
    }
  };

  const openProject = (p) => setProj({ open: true, project: p });

  const kecOptions = useMemo(() => kecamatan.map((k) => ({ ...k, slug: k.id })), [kecamatan]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      <Navbar translucent />
      <MapView
        projects={projects}
        kecamatan={kecamatan}
        issues={issues}
        activeSectors={active}
        onProjectClick={openProject}
        onKecamatanClick={openKec}
        focus={focus}
        tilt={tilt}
      />

      <HudStrip stats={stats} tilt={tilt} setTilt={setTilt} />

      {/* search kecamatan */}
      <div className="fixed top-[204px] left-3 right-3 lg:left-6 lg:right-auto lg:top-[150px] z-20 lg:w-[300px]">
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <button
              data-testid="kecamatan-search-button"
              className="w-full hud-strong rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 flex items-center gap-2 hover:text-slate-100"
            >
              <Search size={14} className="text-teal-400" />
              Cari kecamatan…
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 bg-slate-950 border-slate-800" align="start">
            <Command className="bg-slate-950">
              <CommandInput placeholder="Ketik nama kecamatan..." data-testid="kecamatan-search-input" />
              <CommandList className="max-h-[320px] scrollbar-slim">
                <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                <CommandGroup heading="29 Kecamatan">
                  {kecOptions.map((k) => (
                    <CommandItem
                      key={k.id}
                      value={k.name}
                      onSelect={() => {
                        setSearchOpen(false);
                        openKec(k);
                      }}
                      className="cursor-pointer"
                      data-testid={`kec-option-${k.id}`}
                    >
                      {k.name}
                      {k.is_approximate && <span className="ml-auto text-[10px] text-amber-400 mono">approx</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <SectorToolbar
        active={active}
        onToggle={toggleSector}
        onClear={() => setActive([])}
      />

      <KecamatanPanel
        open={kecPanel.open}
        onOpenChange={(o) => setKecPanel({ ...kecPanel, open: o })}
        data={kecPanel.data}
      />
      <ProjectPopup
        open={proj.open}
        onOpenChange={(o) => setProj({ ...proj, open: o })}
        project={proj.project}
      />
    </div>
  );
}
