import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/inventory/")({
  component: InventoryPage,
});

function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Inventory</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
          Add Item
        </button>
      </div>

      <div className="bg-card rounded-lg shadow p-6">
        <p className="text-muted-foreground">
          Welcome, manage your complete inventory here.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Track all your printing supplies, tools, spare parts, and finished
          products.
        </div>
      </div>
    </div>
  );
}

