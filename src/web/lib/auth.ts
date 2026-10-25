import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const TOKEN_KEY = "tm_bearer";

export const getToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

export const authClient = createAuthClient({
  baseURL: window.location.origin,
  basePath: "/api/auth",
  plugins: [usernameClient()],
  fetchOptions: {
    auth: { type: "Bearer", token: () => getToken() },
    onSuccess: (ctx) => {
      const token = ctx.response.headers.get("set-auth-token");
      if (token) localStorage.setItem(TOKEN_KEY, token);
    },
  },
});

export async function signOut() {
  await authClient.signOut().catch(() => {});
  localStorage.removeItem(TOKEN_KEY);
}
