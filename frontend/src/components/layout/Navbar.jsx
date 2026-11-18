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
      className={`aks-navbar ${translucent ? "fixed top-0 left-0 right-0 z-30" : "sticky top-0 z-30"} ${translucent ? "bg-[#120c2b]/90 backdrop-blur-lg" : "bg-[#120c2b]/95 backdrop-blur-md"}`}
    >
      <div className="max-w-[1480px] mx-auto flex items-center gap-3 px-4 sm:px-6 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0" data-testid="brand-link">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 via-blue-600 to-teal-500 grid place-items-center shadow-[0_0_14px_rgba(139,92,246,0.45)]">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight text-sm sm:text-base bg-gradient-to-r from-violet-300 via-blue-300 to-teal-300 bg-clip-text text-transparent">AKSINYATA</div>
            <div className="text-[10px] uppercase tracking-widest text-violet-300/80 mono">Kab. Tangerang</div>
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
                  isActive ? "text-white bg-gradient-to-r from-violet-600/80 via-blue-600/70 to-teal-500/70 shadow-[0_0_12px_rgba(99,102,241,0.35)]" : "text-slate-300 hover:text-teal-200 hover:bg-violet-500/15"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to="/admin" data-testid="nav-login-link">
            <Button size="sm" variant="ghost" className="text-violet-200 hover:text-white hover:bg-violet-500/20 border border-violet-500/30">
              <Shield size={14} className="mr-1.5" /> <span className="hidden sm:inline">Admin</span>
            </Button>
          </Link>
          <button className="lg:hidden text-slate-300" onClick={() => setOpen(!open)} data-testid="mobile-menu-toggle" aria-label="menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="lg:hidden border-t border-violet-500/20 bg-[#120c2b]" data-testid="mobile-menu">
          <div className="flex flex-col px-4 py-2">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-md text-sm ${isActive ? "text-white bg-gradient-to-r from-violet-600/80 via-blue-600/70 to-teal-500/70" : "text-slate-300 hover:bg-violet-500/15"}`
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
