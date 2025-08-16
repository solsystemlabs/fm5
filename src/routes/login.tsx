import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../components/pages/LoginPage";
import { authClient } from "../lib/auth-client";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: search.redirect as string,
  }),
  beforeLoad: async ({ search }) => {
    // Check if user is already authenticated
    const session = await authClient.getSession();

    if (session?.data?.session) {
      // User is already logged in, redirect them to intended destination or dashboard
      const redirectTo = (search as LoginSearch)?.redirect || "/dashboard";
      throw redirect({ to: redirectTo });
    }
  },
  component: LoginPage,
});