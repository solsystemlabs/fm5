import { api } from '../../lib/api'

/**
 * Hook for filament inventory management with real-time updates
 */
export function useFilamentInventory() {
  const utils = api.useUtils()

  // Enhanced query with automatic background refetch
  const filamentsQuery = api.filaments.list.useQuery(
    {},
    {
      // Refetch every 5 minutes for real-time inventory
      refetchInterval: 5 * 60 * 1000,
      // Enable background updates
      refetchOnWindowFocus: true,
    }
  )

  const inventoryQuery = api.filaments.inventory.list.useQuery({})

  // Low stock alerts with automatic filtering
  const lowStockQuery = api.filaments.inventory.list.useQuery(
    { lowStock: true },
    {
      // More frequent updates for low stock items
      refetchInterval: 2 * 60 * 1000,
    }
  )

  // Create filament with inventory
  const createFilament = api.filaments.create.useMutation({
    onSuccess: () => {
      // Invalidate both filaments and inventory
      utils.filaments.list.invalidate()
      utils.filaments.inventory.list.invalidate()
    },
  })

  // Update inventory quantity with optimistic updates
  const updateQuantity = api.filaments.inventory.updateQuantity.useMutation({
    onMutate: async ({ id, quantityGrams }) => {
      // Cancel outgoing requests
      await utils.filaments.inventory.list.cancel()

      // Snapshot previous data
      const previousInventory = utils.filaments.inventory.list.getData()

      // Optimistically update
      utils.filaments.inventory.list.setData({}, (old) =>
        old?.map((item) =>
          item.id === id ? { ...item, quantityGrams } : item
        ) ?? []
      )

      return { previousInventory }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousInventory) {
        utils.filaments.inventory.list.setData({}, context.previousInventory)
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      utils.filaments.inventory.list.invalidate()
    },
  })

  return {
    // Data
    filaments: filamentsQuery.data ?? [],
    inventory: inventoryQuery.data ?? [],
    lowStockItems: lowStockQuery.data ?? [],

    // Loading states
    isLoading:
      filamentsQuery.isLoading ||
      inventoryQuery.isLoading ||
      lowStockQuery.isLoading,

    // Mutations
    createFilament: createFilament.mutate,
    updateQuantity: updateQuantity.mutate,

    // Mutation states
    isCreating: createFilament.isPending,
    isUpdating: updateQuantity.isPending,

    // Utilities
    refetchAll: () => {
      filamentsQuery.refetch()
      inventoryQuery.refetch()
      lowStockQuery.refetch()
    },
  }
}

/**
 * Hook for material type statistics with caching
 */
export function useMaterialStats() {
  // Cached query with longer stale time for statistics
  return api.filaments.list.useQuery(
    {},
    {
      // Cache stats for 10 minutes
      staleTime: 10 * 60 * 1000,
      select: (data) => {
        // Transform data on the client side
        const stats = data.reduce(
          (acc, filament) => {
            acc[filament.materialType] = (acc[filament.materialType] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )
        return stats
      },
    }
  )
}