import { auth } from "./auth";
import { data } from "./store";

export const DEFAULT_ADMIN = { username: "admin", password: "Welcome@123!!!" };

let ready: Promise<void> | null = null;

/** Creates the default admin account (admin / Welcome@123!!!) the first time it's needed. */
export function ensureAdmin() {
  ready ??= (async () => {
    if (data.auth.user.length > 0) return;
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
