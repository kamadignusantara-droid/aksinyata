import "@/App.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";
import Beranda from "@/pages/Beranda";
import Sektor from "@/pages/Sektor";
import SektorDetail from "@/pages/SektorDetail";
import Wilayah from "@/pages/Wilayah";
import WilayahDetail from "@/pages/WilayahDetail";
import Proyek from "@/pages/Proyek";
import ProyekDetail from "@/pages/ProyekDetail";
import Capaian from "@/pages/Capaian";
import KabarLapangan from "@/pages/KabarLapangan";
import DataLaporan from "@/pages/DataLaporan";
import Partisipasi from "@/pages/Partisipasi";
import Tentang from "@/pages/Tentang";
import AdminLogin from "@/pages/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminOverview from "@/pages/admin/AdminOverview";
import { AdminProjects, AdminFieldUpdates, AdminIssues, AdminIndicators } from "@/pages/admin/AdminResources";
import AdminFeedback from "@/pages/admin/AdminFeedback";
import AdminSettings from "@/pages/admin/AdminSettings";

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

const AdminRoot = () => (
  <ClerkAuthProvider>
    <Outlet />
  </ClerkAuthProvider>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Beranda />} />
          <Route path="/sektor" element={<Sektor />} />
          <Route path="/sektor/:id" element={<SektorDetail />} />
          <Route path="/wilayah" element={<Wilayah />} />
          <Route path="/wilayah/:id" element={<WilayahDetail />} />
          <Route path="/proyek" element={<Proyek />} />
          <Route path="/proyek/:id" element={<ProyekDetail />} />
          <Route path="/capaian" element={<Capaian />} />
          <Route path="/kabar-lapangan" element={<KabarLapangan />} />
          <Route path="/data-laporan" element={<DataLaporan />} />
          <Route path="/partisipasi" element={<Partisipasi />} />
          <Route path="/tentang" element={<Tentang />} />
          <Route path="/admin" element={<AdminRoot />}>
            <Route path="login/*" element={<AdminLogin />} />
            <Route element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="proyek" element={<AdminProjects />} />
              <Route path="kabar" element={<AdminFieldUpdates />} />
              <Route path="isu" element={<AdminIssues />} />
              <Route path="capaian" element={<AdminIndicators />} />
              <Route path="masukan" element={<AdminFeedback />} />
              <Route path="pengaturan" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
