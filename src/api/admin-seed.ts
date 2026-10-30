import { auth } from "./auth";
import { data } from "./store";

export const DEFAULT_ADMIN = { username: "admin", password: "Welcome@123!!!" };

let ready: Promise<void> | null = null;

/**
 * Forgot the admin password? Set ADMIN_PASSWORD on the hosting (Vercel/Hostinger
 * environment variables) and reload /admin — the admin password becomes that value.
 * Remove the variable again afterwards.
 */
async function resetFromEnv() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || pw.length < 8) return;
  const ctx = await auth.$context;
  const user = data.auth.user[0] as { id: string };
  const account = (data.auth.account as { userId: string; providerId: string; password?: string }[]).find(
    (a) => a.userId === user.id && a.providerId === "credential",
  );
  if (account?.password && (await ctx.password.verify({ hash: account.password, password: pw }))) return;
  await ctx.internalAdapter.updatePassword(user.id, await ctx.password.hash(pw));
  console.log("Admin password was reset from ADMIN_PASSWORD.");
}

/** Creates the default admin account (admin / Welcome@123!!!) the first time it's needed. */
export function ensureAdmin() {
  ready ??= (async () => {
    if (data.auth.user.length > 0) {
      await resetFromEnv();
      return;
    }
    await auth.api.signUpEmail({
      body: {
        name: "Admin",
        email: "admin@triminds.local",
        password: DEFAULT_ADMIN.password,
        username: DEFAULT_ADMIN.username,
      },
    });
  })().catch((err) => {
    ready = null;
    console.error("Could not create default admin", err);
  });
  return ready;
}
