import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/models')({
  component: ModelsPage,
})

function ModelsPage() {
  const context = Route.useRouteContext();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">3D Models</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
          Upload Model
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, {context.user?.email}! Manage your 3D model library here.
        </p>
        <div className="mt-4 text-sm text-gray-500">
          Store, organize, and version your STL, OBJ, and other 3D model files.
        </div>
      </div>
    </div>
  );
}
