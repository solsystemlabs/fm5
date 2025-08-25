import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2 text-card-foreground">Welcome to FM5 Manager!</h2>
        <p className="text-muted-foreground">Welcome</p>
      </div>
    </div>
  );
}

