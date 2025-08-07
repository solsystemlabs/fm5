import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  redirect,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import Header from "../components/layout/Header";
import { authClient } from "../lib/auth-client";
import appCss from "../styles/global.css?url";

const queryClient = new QueryClient();

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FM5 Manager" },
    ],
    links: [
      { rel: "preload", href: appCss, as: "style" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  beforeLoad: async ({ location }) => {
    // Skip auth check for public routes
    if (location.pathname === "/login" || location.pathname === "/") {
      return {};
    }

    // Check authentication for all other routes
    const session = await authClient.getSession();
    if (!session?.data?.session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.pathname },
      });
    }

    return {
      user: session.data.user,
      session: session.data.session,
    };
  },
  component: RootComponent,
  notFoundComponent: () => (
    <div className="flex w-full h-full justify-center items-center text-lg">
      404 Not Found
    </div>
  ),
});

function RootComponent() {
  return (
    <RootDocument>
      <QueryClientProvider client={queryClient}>
        <div className="w-full h-full min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Outlet />
          </main>
        </div>
      </QueryClientProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className="flex w-full h-full">
      <head>
        <HeadContent />
      </head>
      <body className="flex w-full h-full">
        {children}
        <Scripts />
      </body>
    </html>
  );
}
