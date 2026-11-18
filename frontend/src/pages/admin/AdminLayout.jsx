import { useState } from "react";
import { Navigate, NavLink, Outlet, Link } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/react";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, FolderKanban, Newspaper, AlertTriangle, Target, MessageSquare, Settings, LogOut, Map, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminApi } from "./useAdminApi";

const NAV = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard, end: true, id: "overview" },
  { to: "/admin/proyek", label: "Proyek", icon: FolderKanban, id: "projects" },
  { to: "/admin/kabar", label: "Kabar Lapangan", icon: Newspaper, id: "updates" },
  { to: "/admin/isu", label: "Respons Isu", icon: AlertTriangle, id: "issues" },
  { to: "/admin/capaian", label: "Capaian & Target", icon: Target, id: "indicators" },
  { to: "/admin/masukan", label: "Masukan Warga", icon: MessageSquare, id: "feedback" },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings, id: "settings" },
];

const Center = ({ children, testId }) => (
  <div className="min-h-screen bg-slate-950 grid place-items-center px-6 text-center" data-testid={testId}>
    <div className="max-w-sm">{children}</div>
  </div>
);

const Denied = () => {
  const { signOut } = useClerk();
  return (
    <Center testId="admin-access-denied">
      <h1 className="text-xl font-bold text-slate-50">Akses ditolak</h1>
      <p className="text-sm text-slate-400 mt-2">Akun ini tidak terdaftar sebagai admin AKSINYATA. Pastikan email sudah terverifikasi.</p>
      <div className="flex gap-2 justify-center mt-5">
        <Link to="/"><Button variant="outline" data-testid="denied-home-btn">Ke beranda</Button></Link>
        <Button onClick={() => signOut({ redirectUrl: "/admin/login" })} data-testid="denied-signout-btn">Keluar</Button>
      </div>
    </Center>
  );
};

const SideNav = ({ onNavigate }) => {
  const { signOut } = useClerk();
  return (
    <nav className="flex flex-col gap-1 p-3 h-full">
      {NAV.map(({ to, label, icon: Icon, end, id }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} data-testid={`admin-nav-${id}`}
          className={({ isActive }) => `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${isActive ? "bg-cyan-500/10 text-cyan-300" : "text-slate-300 hover:bg-slate-800/70"}`}>
          <Icon size={16} /> {label}
        </NavLink>
      ))}
      <div className="mt-auto pt-4 border-t border-slate-800 flex flex-col gap-1">
        <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-slate-100" data-testid="admin-nav-public">
          <Map size={16} /> Lihat situs publik
        </Link>
        <button onClick={() => signOut({ redirectUrl: "/admin/login" })} className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-slate-400 hover:text-rose-300 text-left" data-testid="admin-signout-btn">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </nav>
  );
};

const Shell = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex" data-testid="admin-shell">
      <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-950 sticky top-0 h-screen">
        <Brand />
        <SideNav />
      </aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black/60" onClick={() => setOpen(false)}>
          <aside className="w-64 h-full bg-slate-950 border-r border-slate-800 flex flex-col" onClick={(e) => e.stopPropagation()}>
            <Brand />
            <SideNav onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 border-b border-slate-800">
          <button onClick={() => setOpen(!open)} data-testid="admin-mobile-menu-toggle" aria-label="menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
          <span className="font-bold text-slate-50">AKSINYATA Admin</span>
        </div>
        <main className="p-4 sm:p-8 max-w-[1400px]"><Outlet /></main>
      </div>
    </div>
  );
};

const Brand = () => (
  <div className="px-5 h-16 flex items-center gap-2 border-b border-slate-800">
    <div className="w-7 h-7 rounded-md bg-cyan-500/20 border border-cyan-500/40 grid place-items-center text-cyan-300 font-black text-sm">A</div>
    <div className="leading-tight">
      <div className="font-bold text-slate-50 text-sm">AKSINYATA</div>
      <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Panel Admin</div>
    </div>
  </div>
);

export default function AdminLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const api = useAdminApi();
  const me = useQuery({ queryKey: ["me"], queryFn: async () => (await api.get("/me")).data, enabled: !!isSignedIn });
  if (!isLoaded || (isSignedIn && me.isLoading)) return <Center testId="admin-loading"><p className="text-slate-400 text-sm">Memeriksa akses...</p></Center>;
  if (!isSignedIn) return <Navigate to="/admin/login" replace />;
  if (me.isError && me.error?.response?.status !== 403) {
    return (
      <Center testId="admin-me-error">
        <p className="text-slate-300 text-sm">Gagal memeriksa akses. Periksa koneksi lalu coba lagi.</p>
        <Button className="mt-4" onClick={() => me.refetch()} data-testid="admin-me-retry">Coba lagi</Button>
      </Center>
    );
  }
  if (me.data?.role !== "admin") return <Denied />;
  return <Shell />;
}
