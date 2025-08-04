import { createAuthClient } from "better-auth/react";
import { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;
