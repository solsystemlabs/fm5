import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "../../components/pages/LoginPage";
import { authClient } from "../../lib/auth-client";

type LoginSearch = {
  redirect?: string;
};

export const Route = createFileRoute("/_public/login/")({
  beforeLoad: async ({ search }) => {
    const session = await authClient.getSession();

    if (session?.data?.session) {
      // User is already logged in, redirect them
      const redirectTo = (search as LoginSearch)?.redirect || "/products";
      throw redirect({ to: redirectTo });
    }
  },
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: search.redirect as string,
  }),
  component: LoginPage,
});
