import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { getAuthSession } from "../lib/auth-utils";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async ({ location }) => {
    if (!getAuthSession()) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Outlet />
    </>
  );
}
