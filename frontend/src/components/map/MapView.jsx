import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { statusById, sectorById, KAB_CENTER, MAP_COLORS } from "@/lib/constants";

// Positron base from OpenFreeMap (no key), recoloured with the AKSINYATA palette
const BASE_STYLE = "https://tiles.openfreemap.org/styles/positron";

export default function MapView({
  projects = [],
  kecamatan = [],
  issues = [],
  activeSectors = [],
  onProjectClick,
  onKecamatanClick,
  focus,          // { lat, lng, zoom }
  tilt = true,    // 2.5D by default
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerRefs = useRef([]);
  const [ready, setReady] = useState(false);

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      center: [KAB_CENTER.lng, KAB_CENTER.lat],
      zoom: KAB_CENTER.zoom,
      pitch: tilt ? 50 : 0,
      bearing: tilt ? -20 : 0,
      attributionControl: false,
      cooperativeGestures: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "bottom-right");

    map.on("load", () => {
      // AKSINYATA palette: ungu, biru, tosca (+ magenta accent) on a deep purple base
      try {
        const style = map.getStyle();
        const set = (id, prop, val) => { try { map.setPaintProperty(id, prop, val); } catch {} };
        style.layers.forEach((l) => {
          const id = l.id;
          if (l.type === "background") set(id, "background-color", MAP_COLORS.base);
          if (l.type === "fill") {
            if (/water|ocean|river|lake/.test(id)) set(id, "fill-color", MAP_COLORS.water);
            else if (/park|wood|forest|grass|landcover|farmland|wetland/.test(id)) set(id, "fill-color", MAP_COLORS.green);
            else if (/residential|landuse|urban|suburb/.test(id)) set(id, "fill-color", MAP_COLORS.urban);
            else if (/building/.test(id)) set(id, "fill-color", MAP_COLORS.building);
            else set(id, "fill-color", MAP_COLORS.land);
          }
          if (l.type === "line") {
            if (/casing/.test(id)) set(id, "line-color", MAP_COLORS.casing);
            else if (/motorway|trunk|major|primary/.test(id)) set(id, "line-color", MAP_COLORS.roadMajor);
            else if (/secondary|tertiary/.test(id)) set(id, "line-color", MAP_COLORS.roadMid);
            else if (/road|highway|minor|street|path|service|track/.test(id)) set(id, "line-color", MAP_COLORS.roadMinor);
            else if (/rail/.test(id)) set(id, "line-color", MAP_COLORS.rail);
            else if (/water|river|stream|canal/.test(id)) set(id, "line-color", MAP_COLORS.waterLine);
            else if (/boundary|admin/.test(id)) set(id, "line-color", MAP_COLORS.boundary);
            else set(id, "line-color", MAP_COLORS.roadMinor);
          }
          if (l.type === "symbol") {
            set(id, "text-color", /water|ocean|river/.test(id) ? MAP_COLORS.labelWater : MAP_COLORS.label);
            set(id, "text-halo-color", MAP_COLORS.base);
            set(id, "text-halo-width", 1.2);
          }
        });

        // 3D buildings, coloured by height: ungu (low) -> biru -> tosca (tall)
        const layers = map.getStyle().layers;
        const building = layers.find((l) => l.id === "building" || l.id === "building-top");
        if (building && tilt) {
          try {
            const height = ["coalesce", ["get", "render_height"], ["get", "height"], 8];
            map.addLayer({
              id: "aks-3d-buildings",
              source: building.source,
              "source-layer": building["source-layer"] || "building",
              type: "fill-extrusion",
              minzoom: 13,
              paint: {
                "fill-extrusion-color": [
                  "interpolate", ["linear"], height,
                  0, MAP_COLORS.bLow,
                  15, MAP_COLORS.bMid,
                  40, MAP_COLORS.bHigh,
                ],
                "fill-extrusion-height": [
                  "interpolate", ["linear"], ["zoom"],
                  13, 0, 14, height,
                ],
                "fill-extrusion-base": 0,
                "fill-extrusion-opacity": 0.85,
              },
            });
          } catch (e) {
            // some styles don't expose the building layer in a way we can extrude
          }
        }
      } catch {}
      setReady(true);
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle 2D/3D
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    map.easeTo({ pitch: tilt ? 50 : 0, bearing: tilt ? -20 : 0, duration: 500 });
    try {
      if (map.getLayer("aks-3d-buildings")) {
        map.setLayoutProperty("aks-3d-buildings", "visibility", tilt ? "visible" : "none");
      }
    } catch {}
  }, [tilt, ready]);

  // Focus
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.flyTo({ center: [focus.lng, focus.lat], zoom: focus.zoom || 13, pitch: tilt ? 50 : 0, essential: true });
  }, [focus, tilt]);

  // Markers for projects
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = [];

    const filtered = activeSectors.length
      ? projects.filter((p) => activeSectors.includes(p.sector_id))
      : projects;

    filtered.forEach((p) => {
      const s = statusById(p.status);
      const sec = sectorById(p.sector_id);
      const el = document.createElement("div");
      el.className = "aks-marker";
      el.setAttribute("data-testid", `map-marker-${p.id}`);
      el.innerHTML = `
        <div class="aks-marker-label">${(p.name || "").replace(/\[CONTOH\]\s*/, "").slice(0, 24)}${p.name && p.name.length > 24 ? "…" : ""}</div>
        <div class="aks-marker-stem" style="background:linear-gradient(${s.hex}, transparent);"></div>
        <div class="aks-marker-dot" style="background:${s.hex};box-shadow:0 0 0 3px ${s.hex}40, 0 0 12px ${s.hex}aa;"></div>
      `;
      el.title = `${sec.name} • ${s.label}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onProjectClick && onProjectClick(p);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([p.longitude, p.latitude])
        .addTo(map);
      markerRefs.current.push(marker);
    });

    // Issues as warning icons
    issues.forEach((iss) => {
      if (iss.latitude == null || iss.longitude == null) return;
      const el = document.createElement("div");
      el.className = "aks-marker-issue";
      el.setAttribute("data-testid", `map-issue-${iss.id}`);
      el.innerText = "!";
      el.title = `Respons Isu: ${iss.title}`;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onProjectClick && onProjectClick({ ...iss, _isIssue: true });
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([iss.longitude, iss.latitude])
        .addTo(map);
      markerRefs.current.push(marker);
    });

    // Kecamatan centroid markers — subtle labels
    kecamatan.forEach((k) => {
      const el = document.createElement("div");
      el.style.cssText =
        `width:10px;height:10px;border-radius:50%;background:${MAP_COLORS.kecDot};border:1px solid rgba(255,255,255,0.45);box-shadow:0 0 8px ${MAP_COLORS.kecDot};cursor:pointer;`;
      el.title = k.name + (k.is_approximate ? " (lokasi perkiraan)" : "");
      el.setAttribute("data-testid", `kec-dot-${k.id}`);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onKecamatanClick && onKecamatanClick(k);
      });
      const marker = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([k.longitude, k.latitude])
        .addTo(map);
      markerRefs.current.push(marker);
    });
  }, [projects, issues, kecamatan, activeSectors, ready, onProjectClick, onKecamatanClick]);

  return (
    <div className="absolute inset-0" style={{ background: MAP_COLORS.base }}>
      <div ref={containerRef} data-testid="map-canvas-container" className="w-full h-full" />
    </div>
  );
}
