import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Shield, Menu, X } from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Beranda" },
  { to: "/sektor", label: "Sektor" },
  { to: "/wilayah", label: "Wilayah" },
  { to: "/proyek", label: "Proyek" },
  { to: "/capaian", label: "Capaian" },
  { to: "/kabar-lapangan", label: "Kabar Lapangan" },
  { to: "/data-laporan", label: "Data" },
  { to: "/partisipasi", label: "Partisipasi" },
  { to: "/tentang", label: "Tentang" },
];

export default function Navbar({ translucent = false }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      data-testid="site-navbar"
      className={`${translucent ? "fixed top-0 left-0 right-0 z-30" : "sticky top-0 z-30 border-b border-slate-800/80"} ${translucent ? "hud-strong" : "bg-slate-950/95 backdrop-blur-md"}`}
    >
      <div className="max-w-[1480px] mx-auto flex items-center gap-3 px-4 sm:px-6 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="brand-link">
          <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 grid place-items-center">
            <span className="text-cyan-300 font-black text-sm">A</span>
          </div>
          <div className="leading-tight">
            <div className="text-slate-50 font-bold tracking-tight text-sm sm:text-base">AKSINYATA</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 mono">Kab. Tangerang</div>
          </div>
        </Link>
        <nav className="hidden lg:flex items-center gap-1 ml-6">
          {navItems.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === "/"}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm transition-colors ${
                  isActive ? "text-cyan-300 bg-cyan-500/10" : "text-slate-300 hover:text-slate-50 hover:bg-slate-800/60"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/admin" data-testid="nav-login-link">
            <Button size="sm" variant="ghost" className="text-slate-400 hover:text-slate-50">
              <Shield size={14} className="mr-1.5" /> <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
          <button className="lg:hidden text-slate-300" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950" data-testid="mobile-menu">
          <div className="flex flex-col px-4 py-2">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-sm ${isActive ? "text-cyan-300 bg-cyan-500/10" : "text-slate-300"}`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
