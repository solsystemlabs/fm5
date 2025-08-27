import { useProducts } from "@/lib/api-hooks";
import { createFileRoute } from "@tanstack/react-router";
import ProductsTable from "../../components/tables/ProductsTable";
import FMButton from "../../components/ui/FMButton";
import AddProductDialog from "../../components/dialogs/AddProductDialog";

export const Route = createFileRoute("/products/")({
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products = [], isLoading, error } = useProducts();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-foreground text-3xl font-bold">Products</h1>
        <div className="bg-card rounded-lg p-8 text-center shadow">
          <p className="text-destructive">
            Error loading products: {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-foreground text-base font-semibold">Products</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            A complete list of all your 3D printing products including their
            models, pricing, and associated filaments.
          </p>
        </div>
        <AddProductDialog
          triggerElement={
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <FMButton size="lg">Add Product</FMButton>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="mt-8 p-8 text-center">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <ProductsTable data={products} />
      )}
    </div>
  );
}

