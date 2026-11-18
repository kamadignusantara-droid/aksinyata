import { SignIn } from "@clerk/react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  return (
    <div className="min-h-screen bg-slate-950 grain flex flex-col">
      <div className="px-6 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-cyan-300">
          <ArrowLeft size={14} /> Kembali ke peta
        </Link>
      </div>
      <main className="flex-1 flex items-center justify-center px-6 py-8" data-testid="admin-login-page">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="text-[10px] uppercase tracking-widest text-cyan-300 mono">Admin Internal</div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-50 mt-1">Masuk ke Panel AKSINYATA</h1>
            <p className="text-sm text-slate-400 mt-2">Khusus tim internal. Pendaftaran publik tidak dibuka.</p>
          </div>
          <SignIn routing="path" path="/admin/login" signUpUrl="/admin/login" withSignUp />
        </div>
      </main>
    </div>
  );
}
