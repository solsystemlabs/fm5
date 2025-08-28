import { createFileRoute } from '@tanstack/react-router';
import { useBrandsTRPC } from '@/lib/trpc-hooks';

export const Route = createFileRoute('/trpc-test')({
  component: TRPCTestPage,
});

function TRPCTestPage() {
  const { data: brands, isLoading, error } = useBrandsTRPC();

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">tRPC Test - Error</h1>
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">tRPC Test - Loading</h1>
        <p>Loading brands...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">tRPC Test - Success!</h1>
      <p className="mb-4">Successfully fetched {brands?.length || 0} brands using tRPC:</p>
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(brands, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          This data was fetched using the new tRPC integration with full type safety!
        </p>
      </div>
    </div>
  );
}