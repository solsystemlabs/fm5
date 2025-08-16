import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { authClient } from "../lib/auth-client";
import * as fs from "node:fs";
const filePath = "count.txt";

async function readCount() {
  return parseInt(
    await fs.promises.readFile(filePath, "utf-8").catch(() => "0"),
  );
}

const getCount = createServerFn({
  method: "GET",
}).handler(() => {
  return readCount();
});

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    // Check if user is authenticated
    const session = await authClient.getSession();
    
    if (session?.data?.session) {
      // User is authenticated, redirect to dashboard
      throw redirect({ to: "/dashboard" });
    }
  },
  component: Home,
  loader: async () => await getCount(),
});

function Home() {
  const count = Route.useLoaderData();

  return (
    <div className="text-center space-y-6">
      <h1 className="text-4xl font-bold text-gray-900">
        Welcome to FM5 Manager
      </h1>
      <p className="text-xl text-gray-600">
        Your complete 3D printing management solution
      </p>
      <p className="text-sm text-gray-500">
        Page visits: {count}
      </p>
    </div>
  );
}
