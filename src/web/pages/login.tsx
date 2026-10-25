import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { authClient } from "../lib/auth";
import { useSite } from "../queries/site";

/** /admin — admin login. Signed-in admins go straight to the dashboard. */
export default function LoginPage() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: session, isPending } = authClient.useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const site = useSite();

  useEffect(() => {
    document.title = "Admin Login";
  }, []);

  useEffect(() => {
    if (session) navigate("/admin/dashboard", { replace: true });
  }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) return setError("Please enter your username and password.");
    setBusy(true);
    const res = await authClient.signIn.username({ username: username.trim().toLowerCase(), password });
    setBusy(false);
    if (res.error) return setError("Wrong username or password.");
    await qc.invalidateQueries();
    navigate("/admin/dashboard");
  };

  if (isPending || session) {
    return (
      <div className="admin-theme grid min-h-screen place-items-center bg-slate-100">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="admin-theme flex min-h-screen flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white">
          {site.siteName.charAt(0).toUpperCase()}
        </span>
        <div className="leading-tight">
          <p className="text-[17px] font-semibold text-slate-900">{site.siteName}</p>
          <p className="text-[13px] text-slate-500">Admin Panel</p>
        </div>
      </div>
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-7 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Log in</h1>
        <p className="mt-1 text-[14px] text-slate-500">Enter your admin username and password.</p>
        <form onSubmit={submit} noValidate className="mt-6 grid gap-3">
          <label className="relative">
            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Username"
              autoComplete="username"
              autoCapitalize="none"
              className="field !pl-11"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>
          <label className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              aria-label="Password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              className="field !pl-11 !pr-12"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-900"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </label>
          {error && <p className="text-[13.5px] font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={busy} className="btn-brand mt-2 h-11">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Log in
          </button>
        </form>
      </div>
      <a href="/" className="mt-6 flex items-center gap-1.5 text-[13.5px] font-medium text-slate-500 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Back to website
      </a>
    </div>
  );
}
