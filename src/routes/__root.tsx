import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import Header from "../components/layout/Header";
import { ThemeProvider } from "../lib/theme-context";
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
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <div className="w-full h-full min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <Outlet />
            </main>
          </div>
        </QueryClientProvider>
      </ThemeProvider>
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