import { api } from '../../lib/api'

/**
 * Hook for print queue management with real-time updates
 */
export function usePrintQueue() {
  const utils = api.useUtils()

  // Real-time queue with auto-refresh
  const queueQuery = api.queue.list.useQuery(
    {},
    {
      // Refresh every 30 seconds for active queue monitoring
      refetchInterval: 30 * 1000,
      refetchOnWindowFocus: true,
    }
  )

  // Queue statistics with caching
  const statsQuery = api.queue.stats.useQuery(
    undefined,
    {
      // Cache stats for 1 minute
      staleTime: 60 * 1000,
      refetchInterval: 60 * 1000,
    }
  )

  // Add job to queue with optimistic updates
  const addJob = api.queue.add.useMutation({
    onMutate: async (newJob) => {
      await utils.queue.list.cancel()

      const previousQueue = utils.queue.list.getData()

      // Optimistically add to queue
      utils.queue.list.setData({}, (old) => ({
        jobs: old?.jobs ? [...old.jobs] : [],
        nextCursor: old?.nextCursor,
      }))

      return { previousQueue }
    },
    onError: (err, newJob, context) => {
      if (context?.previousQueue) {
        utils.queue.list.setData({}, context.previousQueue)
      }
    },
    onSuccess: () => {
      // Invalidate both queue and stats
      utils.queue.list.invalidate()
      utils.queue.stats.invalidate()
    },
  })

  // Update job status with real-time feedback
  const updateJobStatus = api.queue.updateStatus.useMutation({
    onMutate: async ({ id, status, completionPercentage }) => {
      await utils.queue.list.cancel()

      const previousQueue = utils.queue.list.getData()

      // Optimistically update job status
      utils.queue.list.setData({}, (old) => ({
        jobs:
          old?.jobs.map((job) =>
            job.id === id
              ? {
                  ...job,
                  status,
                  completionPercentage: completionPercentage ?? job.completionPercentage,
                }
              : job
          ) ?? [],
        nextCursor: old?.nextCursor,
      }))

      return { previousQueue }
    },
    onError: (err, variables, context) => {
      if (context?.previousQueue) {
        utils.queue.list.setData({}, context.previousQueue)
      }
    },
    onSuccess: () => {
      // Update both queue and stats
      utils.queue.list.invalidate()
      utils.queue.stats.invalidate()
    },
  })

  // Update priority with optimistic updates
  const updatePriority = api.queue.updatePriority.useMutation({
    onSuccess: () => {
      utils.queue.list.invalidate()
    },
  })

  // Delete job with confirmation
  const deleteJob = api.queue.delete.useMutation({
    onSuccess: () => {
      utils.queue.list.invalidate()
      utils.queue.stats.invalidate()
    },
  })

  return {
    // Data
    jobs: queueQuery.data?.jobs ?? [],
    stats: statsQuery.data,

    // Computed values
    activeJobs: queueQuery.data?.jobs.filter((job) =>
      ['queued', 'printing'].includes(job.status)
    ) ?? [],

    // Loading states
    isLoading: queueQuery.isLoading || statsQuery.isLoading,
    isError: queueQuery.isError || statsQuery.isError,

    // Mutations
    addJob: addJob.mutate,
    updateJobStatus: updateJobStatus.mutate,
    updatePriority: updatePriority.mutate,
    deleteJob: deleteJob.mutate,

    // Mutation states
    isAddingJob: addJob.isPending,
    isUpdatingStatus: updateJobStatus.isPending,
    isUpdatingPriority: updatePriority.isPending,
    isDeletingJob: deleteJob.isPending,

    // Utilities
    refetch: () => {
      queueQuery.refetch()
      statsQuery.refetch()
    },
    invalidateAll: () => {
      utils.queue.invalidate()
    },
  }
}

/**
 * Hook for infinite scroll queue with pagination
 */
export function useInfiniteQueue(status?: 'queued' | 'printing' | 'completed' | 'failed') {
  const infiniteQuery = api.queue.list.useInfiniteQuery(
    { status, limit: 10 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: status ? undefined : 30 * 1000, // Only auto-refresh for all statuses
    }
  )

  return {
    jobs: infiniteQuery.data?.pages.flatMap((page) => page.jobs) ?? [],
    fetchNextPage: infiniteQuery.fetchNextPage,
    hasNextPage: infiniteQuery.hasNextPage,
    isFetchingNextPage: infiniteQuery.isFetchingNextPage,
    isLoading: infiniteQuery.isLoading,
    isError: infiniteQuery.isError,
    error: infiniteQuery.error,
  }
}