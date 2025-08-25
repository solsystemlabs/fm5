import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-foreground">
        Welcome to FM5 Manager
      </h1>
      <p className="text-xl text-muted-foreground">
        Your complete 3D printing management solution
      </p>
    </div>
  );
}
