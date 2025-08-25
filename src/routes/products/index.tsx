import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const context = Route.useRouteContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Add Product
        </button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <p className="text-muted-foreground">
          Welcome, this is your products dashboard.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Manage your 3D printing products, models, and inventory here.
        </div>
      </div>
    </div>
  );
}

