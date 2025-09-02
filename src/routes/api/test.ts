import { createServerFileRoute } from "@tanstack/react-start/server";

export const Route = createServerFileRoute("/api/test")
  .methods({
    async GET() {
      console.log("=== SIMPLE TEST ENDPOINT ===");
      console.log("NODE_ENV:", process.env.NODE_ENV);
      console.log("Timestamp:", new Date().toISOString());
      
      return Response.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        message: "Basic API routing works!",
        env: process.env.NODE_ENV || "unknown"
      });
    },
  });