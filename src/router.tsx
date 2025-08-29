import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getQueryClient } from "./lib/trpc/client";

export function createRouter() {
  const queryClient = getQueryClient();
  
  const router = createTanStackRouter({
    routeTree,
    context: {
      queryClient,
    },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0, // Always allow fresh data fetching
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
