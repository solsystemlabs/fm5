import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { authClient } from "../lib/auth-client";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    // Check authentication status
    const session = await authClient.getSession();
    
    if (!session?.data?.session) {
      // User is not authenticated, redirect to login with current location
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }

    // Return user data for routes to access
    return {
      user: session.data.user,
      session: session.data.session,
    };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  return <Outlet />;
}