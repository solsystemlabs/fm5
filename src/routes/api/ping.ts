import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/api/ping").methods({
  GET: async () => {
    return Response.json({ status: "pong", timestamp: Date.now() });
  },
});