import { createServerFileRoute } from "@tanstack/react-start/server";

export const Route = createServerFileRoute("/api/debug")
  .methods({
    async GET() {
      try {
        console.log("=== DEBUG ENDPOINT CALLED ===");
        
        // Check environment variables (safely)
        const envCheck = {
          NODE_ENV: process.env.NODE_ENV || "missing",
          PROJECT_NAME: process.env.PROJECT_NAME || "missing",
          DATABASE_URL: process.env.DATABASE_URL ? "present" : "missing",
          DIRECT_URL: process.env.DIRECT_URL ? "present" : "missing",
          BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "missing",
          BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "present" : "missing",
          AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? "present" : "missing",
          AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? "present" : "missing",
          AWS_REGION: process.env.AWS_REGION || "missing",
          AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME || "missing",
        };

        console.log("Environment variables check:", envCheck);

        // Test database connection
        let databaseStatus = "unknown";
        try {
          const { PrismaClient } = await import("@prisma/client");
          const prisma = new PrismaClient();
          await prisma.$connect();
          databaseStatus = "connected";
          await prisma.$disconnect();
          console.log("Database connection: SUCCESS");
        } catch (dbError) {
          console.error("Database connection error:", dbError);
          databaseStatus = `error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`;
        }

        const debugInfo = {
          timestamp: new Date().toISOString(),
          status: "healthy",
          environment: envCheck,
          database: databaseStatus,
          runtime: "cloudflare-pages",
        };

        console.log("Debug info:", debugInfo);

        return Response.json(debugInfo);
      } catch (error) {
        console.error("=== DEBUG ENDPOINT ERROR ===");
        console.error("Error details:", error);
        console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");

        return Response.json(
          {
            timestamp: new Date().toISOString(),
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
          },
          { status: 500 }
        );
      }
    },
  });