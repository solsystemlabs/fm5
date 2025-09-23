import { api } from '../../lib/api'

// Example hooks demonstrating modern tRPC + Tanstack Query integration

/**
 * Hook for fetching models with optimistic updates and cache invalidation
 */
export function useModels(filters?: {
  search?: string
  category?: 'keychain' | 'earring' | 'decoration' | 'functional'
}) {
  // Auto-generated tRPC hook with full type safety
  const modelsQuery = api.models.list.useQuery({
    search: filters?.search,
    category: filters?.category,
    limit: 20,
  })

  // Enhanced cache utilities for invalidation
  const utils = api.useUtils()

  // Optimistic create mutation with automatic rollback
  const createModel = api.models.create.useMutation({
    // Optimistic update with automatic rollback on error
    onMutate: async (newModel) => {
      // Cancel any outgoing refetches
      await utils.models.list.cancel()

      // Snapshot the previous value
      const previousModels = utils.models.list.getData()

      // Optimistically update to the new value
      utils.models.list.setData(
        { search: filters?.search, category: filters?.category, limit: 20 },
        (old) => ({
          models: old?.models ? [...old.models] : [],
          nextCursor: old?.nextCursor,
        })
      )

      return { previousModels }
    },
    // On error, rollback to previous state
    onError: (err, newModel, context) => {
      if (context?.previousModels) {
        utils.models.list.setData(
          { search: filters?.search, category: filters?.category, limit: 20 },
          context.previousModels
        )
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      utils.models.list.invalidate()
    },
  })

  // Delete mutation with cache invalidation
  const deleteModel = api.models.delete.useMutation({
    onSuccess: () => {
      // Invalidate and refetch models list
      utils.models.list.invalidate()
    },
  })

  return {
    // Query state and data
    models: modelsQuery.data?.models ?? [],
    isLoading: modelsQuery.isLoading,
    isError: modelsQuery.isError,
    error: modelsQuery.error,

    // Mutation functions
    createModel: createModel.mutate,
    deleteModel: deleteModel.mutate,

    // Mutation states
    isCreating: createModel.isPending,
    isDeleting: deleteModel.isPending,

    // Cache utilities
    refetch: modelsQuery.refetch,
    invalidate: () => utils.models.list.invalidate(),
  }
}

/**
 * Hook for fetching a single model with variants
 */
export function useModelWithVariants(modelId: string) {
  // Parallel queries with suspense support
  const modelQuery = api.models.byId.useQuery(modelId)
  const variantsQuery = api.variants.byModelId.useQuery(modelId)

  return {
    model: modelQuery.data,
    variants: variantsQuery.data ?? [],
    isLoading: modelQuery.isLoading || variantsQuery.isLoading,
    isError: modelQuery.isError || variantsQuery.isError,
    error: modelQuery.error || variantsQuery.error,
  }
}

/**
 * Suspense-enabled hook for models (modern 2025 pattern)
 */
export function useModelsSuspense(filters?: {
  search?: string
  category?: 'keychain' | 'earring' | 'decoration' | 'functional'
}) {
  // Enhanced suspense query with better loading states
  const modelsQuery = api.models.list.useSuspenseQuery({
    search: filters?.search,
    category: filters?.category,
    limit: 20,
  })

  return {
    models: modelsQuery.data.models,
    nextCursor: modelsQuery.data.nextCursor,
  }
}