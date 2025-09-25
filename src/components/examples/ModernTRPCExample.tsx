import { Suspense } from 'react'
import { api } from '../../../lib/api'
import { useModels, useModelsSuspense } from '../../hooks/useModels'

/**
 * Example component demonstrating modern tRPC + Tanstack Query patterns
 */
export function ModernTRPCExample() {
  return (
    <div className="space-y-8 p-6">
      <h1 className="text-2xl font-bold">Modern tRPC Integration Examples</h1>

      {/* Standard query with loading states */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Standard Query Pattern</h2>
        <ModelsListStandard />
      </section>

      {/* Suspense-based query */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Suspense Query Pattern</h2>
        <Suspense fallback={<div>Loading models...</div>}>
          <ModelsListSuspense />
        </Suspense>
      </section>

      {/* Mutation examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Mutation Examples</h2>
        <MutationExamples />
      </section>

      {/* Utils examples */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Cache Management</h2>
        <CacheUtilsExample />
      </section>
    </div>
  )
}

/**
 * Standard query pattern with manual loading states
 */
function ModelsListStandard() {
  const { models, isLoading, isError, error } = useModels()

  if (isLoading) return <div>Loading models...</div>
  if (isError) return <div>Error: {error?.message}</div>

  return (
    <div className="grid gap-4">
      {models.map((model: any) => (
        <div key={model.id} className="p-4 border rounded">
          <h3 className="font-medium">{model.name}</h3>
          <p className="text-sm text-gray-600">by {model.designer}</p>
          <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
            {model.category}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Suspense-based query (modern 2025 pattern)
 */
function ModelsListSuspense() {
  const { models } = useModelsSuspense()

  return (
    <div className="grid gap-4">
      {models.map((model: any) => (
        <div key={model.id} className="p-4 border rounded bg-green-50">
          <h3 className="font-medium">{model.name}</h3>
          <p className="text-sm text-gray-600">by {model.designer}</p>
          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
            {model.category} (Suspense)
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Mutation examples with optimistic updates
 */
function MutationExamples() {
  const { createModel, isCreating } = useModels()

  const handleCreateModel = () => {
    createModel({
      name: `Test Model ${Date.now()}`,
      designer: 'tRPC Example',
      description: 'Created via modern tRPC mutation',
      imageUrls: [],
      category: 'functional',
    })
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCreateModel}
        disabled={isCreating}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isCreating ? 'Creating...' : 'Create Test Model'}
      </button>

      <p className="text-sm text-gray-600">
        This demonstrates optimistic updates - the model appears immediately and
        rolls back on error.
      </p>
    </div>
  )
}

/**
 * Cache utilities demonstration
 */
function CacheUtilsExample() {
  const utils = api.useUtils()

  const actions = [
    {
      label: 'Invalidate Models',
      action: () => utils.models.list.invalidate(),
      description: 'Refetch models data',
    },
    {
      label: 'Prefetch Queue Stats',
      action: () => utils.queue.stats.prefetch(),
      description: 'Preload queue statistics',
    },
    {
      label: 'Reset Models Cache',
      action: () => utils.models.list.reset(),
      description: 'Clear models cache completely',
    },
  ]

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <div key={action.label} className="flex items-center gap-4">
          <button
            onClick={action.action}
            className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm"
          >
            {action.label}
          </button>
          <span className="text-sm text-gray-600">{action.description}</span>
        </div>
      ))}

      <p className="text-sm text-gray-600 mt-4">
        These utilities provide fine-grained cache control with automatic type
        safety and optimized network requests.
      </p>
    </div>
  )
}

/**
 * Real-time data example with automatic refetch
 */
export function RealTimeQueueExample() {
  const stats = api.queue.stats.useQuery()

  return (
    <div className="p-4 border rounded">
      <h3 className="font-medium mb-2">Real-time Print Queue</h3>

      {stats.data && (
        <div className="grid grid-cols-4 gap-4 mb-4 text-sm">
          <div>Total: {stats.data.total}</div>
          <div>Queued: {stats.data.queued}</div>
          <div>Printing: {stats.data.printing}</div>
          <div>Completed: {stats.data.completed}</div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Updates every 10 seconds • Last updated:{' '}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  )
}
