import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { statusById, sectorById, KAB_CENTER } from "@/lib/constants";

// Dark positron-style using OpenFreeMap (no key)
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
      // Apply dark tint by replacing fill paints
      try {
        const style = map.getStyle();
        style.layers.forEach((l) => {
          if (l.type === "background") {
            map.setPaintProperty(l.id, "background-color", "#0a1120");
          }
          if (l.type === "fill") {
            const p = l.paint || {};
            if (l.id.includes("water")) map.setPaintProperty(l.id, "fill-color", "#0b2742");
            else if (l.id.includes("park") || l.id.includes("wood") || l.id.includes("landcover")) {
              map.setPaintProperty(l.id, "fill-color", "#102638");
            } else {
              map.setPaintProperty(l.id, "fill-color", "#111b2e");
            }
          }
          if (l.type === "line") {
            if (l.id.includes("road") || l.id.includes("highway")) {
              map.setPaintProperty(l.id, "line-color", "#1f2d4a");
            } else {
              map.setPaintProperty(l.id, "line-color", "#1a2740");
            }
          }
          if (l.type === "symbol") {
            try {
              map.setPaintProperty(l.id, "text-color", "#94A3B8");
              map.setPaintProperty(l.id, "text-halo-color", "#0a1120");
              map.setPaintProperty(l.id, "text-halo-width", 1.2);
            } catch {}
          }
        });

        // 3D buildings — ensure composite source has building layer (positron has building fills, we add extrusion from OSM buildings via same vector-tile layer if available)
        const layers = map.getStyle().layers;
        const building = layers.find((l) => l.id === "building" || l.id === "building-top");
        if (building && tilt) {
          try {
            map.addLayer({
              id: "aks-3d-buildings",
              source: building.source,
              "source-layer": building["source-layer"] || "building",
              type: "fill-extrusion",
              minzoom: 13,
              paint: {
                "fill-extrusion-color": "#1b2a44",
                "fill-extrusion-height": [
                  "interpolate", ["linear"], ["zoom"],
                  13, 0, 14, ["coalesce", ["get", "render_height"], ["get", "height"], 8],
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
        <div class="aks-marker-stem"></div>
        <div class="aks-marker-dot" style="background:${s.hex};"></div>
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
        "width:10px;height:10px;border-radius:50%;background:rgba(148,163,184,0.35);border:1px solid rgba(255,255,255,0.3);cursor:pointer;";
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
    <div className="absolute inset-0" style={{ background: "#0a1120" }}>
      <div ref={containerRef} data-testid="map-canvas-container" className="w-full h-full" />
    </div>
  );
}
