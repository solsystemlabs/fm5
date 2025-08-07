import { redirect } from "@tanstack/react-router";
import { authClient } from "./auth-client";

export async function requireAuth() {
  const session = await authClient.getSession();

  if (!session?.data?.session) {
    throw redirect({
      to: "/login",
      search: {
        redirect: window.location.pathname,
      },
    });
  }

  return session.data;
}

export async function getAuthSession() {
  try {
    const session = await authClient.getSession();
    return session?.data || null;
  } catch {
    return null;
  }
}

export function useAuthGuard() {
  return {
    requireAuth,
    getAuthSession,
  };
}
