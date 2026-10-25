import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { bearer, username } from "better-auth/plugins";
import { data, jsonAuthAdapter } from "./store";

export const auth = betterAuth({
  basePath: "/api/auth",
  baseURL: process.env.WEBSITE_URL,
  database: jsonAuthAdapter(),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: (request) => {
    const origin = request?.headers.get("origin");
    return origin ? [origin] : ["*"];
  },
  databaseHooks: {
    user: {
      create: {
        // Only one account (the admin) can ever exist. Public sign-up is closed.
        before: async (user) => {
          if (data.auth.user.length > 0) {
            throw new APIError("FORBIDDEN", { message: "Sign-up is closed." });
          }
          return { data: user };
        },
      },
    },
  },
  // never send usage data anywhere
  telemetry: { enabled: false },
  plugins: [bearer(), username()],
});
