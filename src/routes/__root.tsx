import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";
import "../styles/global.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start Starter" },
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
      <Outlet />
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
