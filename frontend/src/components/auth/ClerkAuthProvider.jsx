import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/react";

const appearance = {
  variables: {
    colorPrimary: "#8B5CF6",
    colorBackground: "#0F172A",
    colorForeground: "#F8FAFC",
    colorInput: "#1E293B",
    colorInputForeground: "#F8FAFC",
    colorBorder: "#334155",
    fontFamily: "Plus Jakarta Sans, sans-serif",
    borderRadius: "10px",
  },
  captcha: { theme: "dark" },
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

export default function ClerkAuthProvider({ children }) {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async (attempt = 0) => {
      try {
        const cfg = await (await fetch(`${BACKEND_URL}/api/clerk/config`)).json();
        if (cfg.enabled) return cancelled || setConfig(cfg);
      } catch {}
      if (cancelled) return;
      if (attempt >= 20) return setUnavailable(true);
      setTimeout(() => load(attempt + 1), 1500);
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (unavailable) {
    return (
      <p style={{ padding: 24, color: "#F8FAFC", background: "#0F172A", minHeight: "100vh" }}>
        Login admin tidak tersedia saat ini. Muat ulang halaman untuk mencoba lagi.
      </p>
    );
  }
  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 grid place-items-center text-slate-400 text-sm" data-testid="admin-auth-loading">
        Memuat login admin...
      </div>
    );
  }
  return (
    <ClerkProvider
      publishableKey={config.publishable_key}
      proxyUrl={config.proxy_url || undefined}
      appearance={appearance}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/admin/login"
      signUpUrl="/admin/login"
      signInFallbackRedirectUrl="/admin"
      signUpFallbackRedirectUrl="/admin"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
