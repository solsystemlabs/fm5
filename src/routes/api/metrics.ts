import { createServerFileRoute } from "@tanstack/react-start/server";
import { PrismaClient } from "@prisma/client";

export const ServerRoute = createServerFileRoute("/api/metrics").methods({
  GET: async ({ request }) => {
    const startTime = Date.now();

    try {
      const prisma = new PrismaClient();

      // Collect application metrics
      const metrics: string[] = [];

      // Process metrics
      const memUsage = process.memoryUsage();
      metrics.push(`# HELP nodejs_memory_usage_bytes Memory usage in bytes`);
      metrics.push(`# TYPE nodejs_memory_usage_bytes gauge`);
      metrics.push(`nodejs_memory_usage_bytes{type="rss"} ${memUsage.rss}`);
      metrics.push(
        `nodejs_memory_usage_bytes{type="heap_total"} ${memUsage.heapTotal}`,
      );
      metrics.push(
        `nodejs_memory_usage_bytes{type="heap_used"} ${memUsage.heapUsed}`,
      );
      metrics.push(
        `nodejs_memory_usage_bytes{type="external"} ${memUsage.external}`,
      );

      // Process uptime
      metrics.push(
        `# HELP nodejs_process_uptime_seconds Process uptime in seconds`,
      );
      metrics.push(`# TYPE nodejs_process_uptime_seconds gauge`);
      metrics.push(`nodejs_process_uptime_seconds ${process.uptime()}`);

      // Database connection pool metrics (if available)
      metrics.push(
        `# HELP prisma_database_connections Database connection pool status`,
      );
      metrics.push(`# TYPE prisma_database_connections gauge`);

      // Application-specific metrics
      try {
        // Count filaments
        const filamentCount = await prisma.filament.count();
        metrics.push(`# HELP fm5_filaments_total Total number of filaments`);
        metrics.push(`# TYPE fm5_filaments_total gauge`);
        metrics.push(`fm5_filaments_total ${filamentCount}`);

        // Count models
        const modelCount = await prisma.model.count();
        metrics.push(`# HELP fm5_models_total Total number of 3D models`);
        metrics.push(`# TYPE fm5_models_total gauge`);
        metrics.push(`fm5_models_total ${modelCount}`);

        // Count products
        const productCount = await prisma.product.count();
        metrics.push(`# HELP fm5_products_total Total number of products`);
        metrics.push(`# TYPE fm5_products_total gauge`);
        metrics.push(`fm5_products_total ${productCount}`);
      } catch (dbError) {
        console.error("Database metrics collection failed:", dbError);
        metrics.push(`# HELP fm5_database_error Database connection error`);
        metrics.push(`# TYPE fm5_database_error gauge`);
        metrics.push(`fm5_database_error 1`);
      }

      // HTTP request duration for this metrics call
      const duration = Date.now() - startTime;
      metrics.push(
        `# HELP fm5_metrics_request_duration_ms Duration of metrics collection`,
      );
      metrics.push(`# TYPE fm5_metrics_request_duration_ms gauge`);
      metrics.push(`fm5_metrics_request_duration_ms ${duration}`);

      await prisma.$disconnect();

      return new Response(metrics.join("\n") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } catch (error) {
      console.error("Metrics collection error:", error);

      // Return basic error metrics
      const errorMetrics = [
        `# HELP fm5_metrics_error Metrics collection error`,
        `# TYPE fm5_metrics_error gauge`,
        `fm5_metrics_error 1`,
        `# HELP nodejs_process_uptime_seconds Process uptime in seconds`,
        `# TYPE nodejs_process_uptime_seconds gauge`,
        `nodejs_process_uptime_seconds ${process.uptime()}`,
      ];

      return new Response(errorMetrics.join("\n") + "\n", {
        status: 200,
        headers: {
          "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  },
});

