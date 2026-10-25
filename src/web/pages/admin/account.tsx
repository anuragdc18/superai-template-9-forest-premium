import { useState } from "react";
import { CheckCircle2, KeyRound, Loader2, User } from "lucide-react";
import { AdminLayout } from "./layout";
import { authClient } from "../../lib/auth";

function Msg({ ok, text }: { ok: boolean; text: string }) {
  return ok ? (
    <p className="flex items-center gap-2 rounded-xl bg-wa/10 px-4 py-3 text-[14px] font-medium text-green-700">
      <CheckCircle2 className="h-4 w-4" /> {text}
    </p>
  ) : (
    <p className="rounded-xl bg-red-50 px-4 py-3 text-[14px] font-medium text-red-700">{text}</p>
  );
}

function UsernameCard() {
  const { data: session, refetch } = authClient.useSession();
  const current = (session?.user as { username?: string } | undefined)?.username ?? "";
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = username.trim().toLowerCase();
    if (!/^[a-z0-9_.]{3,30}$/.test(u)) {
      return setMsg({ ok: false, text: "Use 3–30 letters, numbers, dots or underscores." });
    }
    setBusy(true);
    const res = await authClient.updateUser({ username: u });
    setBusy(false);
    if (res.error) return setMsg({ ok: false, text: res.error.message ?? "Could not change username." });
    setUsername("");
    setMsg({ ok: true, text: `Username changed to "${u}". Use it next time you log in.` });
    refetch();
  };

  return (
    <form onSubmit={submit} className="rounded-md bg-white p-6 shadow-[0_1px_15px_rgba(69,65,78,0.08)]">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <User className="h-5 w-5 text-royal" /> Change Username
      </h2>
      <p className="mt-1 text-[14px]">
        Current username: <span className="font-semibold text-navy">{current}</span>
      </p>
      <div className="mt-5 grid gap-3">
        <input
          aria-label="New username"
          autoCapitalize="none"
          className="field"
          placeholder="New username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {msg && <Msg {...msg} />}
        <button type="submit" disabled={busy} className="btn-brand h-12">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save Username
        </button>
      </div>
    </form>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!current) return setMsg({ ok: false, text: "Enter your current password." });
    if (next.length < 8) return setMsg({ ok: false, text: "New password must be at least 8 characters." });
    if (next !== confirm) return setMsg({ ok: false, text: "New passwords do not match." });
    setBusy(true);
    const res = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    setBusy(false);
    if (res.error) {
      return setMsg({ ok: false, text: res.error.code === "INVALID_PASSWORD" ? "Current password is wrong." : (res.error.message ?? "Could not change password.") });
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg({ ok: true, text: "Password changed." });
  };

  return (
    <form onSubmit={submit} className="rounded-md bg-white p-6 shadow-[0_1px_15px_rgba(69,65,78,0.08)]">
      <h2 className="flex items-center gap-2 text-lg font-bold">
        <KeyRound className="h-5 w-5 text-royal" /> Change Password
      </h2>
      <p className="mt-1 text-[14px]">Use at least 8 characters.</p>
      <div className="mt-5 grid gap-3">
        <input aria-label="Current password" type="password" autoComplete="current-password" className="field" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <input aria-label="New password" type="password" autoComplete="new-password" className="field" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} />
        <input aria-label="Confirm new password" type="password" autoComplete="new-password" className="field" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {msg && <Msg {...msg} />}
        <button type="submit" disabled={busy} className="btn-brand h-12">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Save Password
        </button>
      </div>
    </form>
  );
}

export default function AccountPage() {
  return (
    <AdminLayout title="Username & Password" subtitle="Change the details you use to log in to this admin panel.">
      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <UsernameCard />
        <PasswordCard />
      </div>
    </AdminLayout>
  );
}
