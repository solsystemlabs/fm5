import { createServerFileRoute } from "@tanstack/react-start/server";

// ⚠️  DEPRECATED: This API route is deprecated in favor of tRPC dashboard.analytics procedure.
// Use: trpc.dashboard.analytics.useQuery() instead
// This route is kept for backwards compatibility only.

export const ServerRoute = createServerFileRoute(
  "/api/dashboard-analytics",
).methods({
  GET: async ({ request }) => {
    return Response.json(
      { 
        error: "This API route is deprecated", 
        message: "Please use tRPC dashboard.analytics procedure instead",
        migration: {
          old: "GET /api/dashboard-analytics",
          new: "trpc.dashboard.analytics.useQuery()",
          tRPCEndpoint: "/api/trpc/dashboard.analytics"
        }
      },
      { status: 410 } // 410 Gone - indicates deprecated/removed resource
    );
  },
});
