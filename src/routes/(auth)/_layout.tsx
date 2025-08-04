import { createFileRoute } from "@tanstack/react-router";
import Header from "../../components/layout/Header";

export const Route = createFileRoute("/(auth)/_layout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex w-full">
      <Header />
    </div>
  );
}
