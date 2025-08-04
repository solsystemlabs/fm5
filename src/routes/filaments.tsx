import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/filaments')({
  component: FilamentsPage,
})

function FilamentsPage() {
  const context = Route.useRouteContext();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Filaments</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Add Filament
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, {context.user?.email}! Track your filament inventory here.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Monitor colors, materials, remaining quantities, and print settings for all your filaments.
        </div>
      </div>
    </div>
  );
}
