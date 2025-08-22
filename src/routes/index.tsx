import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome to FM5 Manager
      </h1>
      <p className="text-xl text-gray-600">
        Your complete 3D printing management solution
      </p>
    </div>
  );
}
