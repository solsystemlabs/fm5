import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/products')({
  component: ProductsPage,
})

function ProductsPage() {
  const context = Route.useRouteContext();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Product
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, {context.user?.email}! This is your products dashboard.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Manage your 3D printing products, models, and inventory here.
        </div>
      </div>
    </div>
  );
}
