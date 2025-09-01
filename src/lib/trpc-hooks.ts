import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPC } from "./trpc/client";

// ===== FILAMENTS =====

export function useFilamentsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.filaments.list.queryOptions());
}

export function useFilamentsGroupedTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.filaments.grouped.queryOptions());
}

export function useFilamentByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.filaments.byId.queryOptions({ id }));
}

export function useFilamentModelsTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.filaments.models.queryOptions({ id }));
}

export function useCreateFilamentTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.filaments.create.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [["filaments", "list"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["filaments", "grouped"]],
        });
      },
    }),
  );
}

export function useUpdateFilamentTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.filaments.update.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [["filaments"]],
        });
      },
    }),
  );
}

export function useDeleteFilamentTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.filaments.delete.mutationOptions({
      onSuccess: () => {
        // Invalidate related queries
        queryClient.invalidateQueries({
          queryKey: [["filaments"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

// ===== MODELS =====

export function useModelsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.models.list.queryOptions());
}

export function useModelByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.models.byId.queryOptions({ id }));
}

export function useModelFilesTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.models.files.queryOptions({ id }));
}

export function useCreateModelTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.models.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

export function useUpdateModelTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.models.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

export function useDeleteModelTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.models.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

export function useDeleteModelFilesTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.models.deleteFiles.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

export function useModelFilesByModelTRPC(modelId: number) {
  const trpc = useTRPC();
  return useQuery(trpc.models.files.queryOptions({ id: modelId }));
}

// ===== PRODUCTS =====

export function useProductsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.products.list.queryOptions());
}

export function useProductByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.products.byId.queryOptions({ id }));
}

export function useCreateProductTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["products"]],
        });
      },
    }),
  );
}

export function useUpdateProductTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["products"]],
        });
      },
    }),
  );
}

export function useDeleteProductTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.products.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["products"]],
        });
      },
    }),
  );
}

// ===== SLICED FILES =====

export function useSlicedFilesTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.slicedFiles.list.queryOptions());
}

export function useSlicedFileByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.slicedFiles.byId.queryOptions({ id }));
}

export function useSlicedFilesByModelTRPC(modelId: number) {
  const trpc = useTRPC();
  return useQuery(trpc.slicedFiles.byModel.queryOptions({ modelId }));
}

export function useCreateSlicedFileTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.slicedFiles.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["slicedFiles"]],
        });
      },
    }),
  );
}

export function useDeleteSlicedFileTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.slicedFiles.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["slicedFiles"]],
        });
      },
    }),
  );
}

// ===== THREEMF FILES =====

export function useThreeMFFilesTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.threeMFFiles.list.queryOptions());
}

export function useThreeMFFileByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.threeMFFiles.byId.queryOptions({ id }));
}

export function useThreeMFFilesByModelTRPC(modelId: number) {
  const trpc = useTRPC();
  return useQuery(trpc.threeMFFiles.byModelId.queryOptions({ modelId }));
}

export function useCreateThreeMFFileTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.threeMFFiles.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["threeMFFiles"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
      },
    }),
  );
}

export function useDeleteThreeMFFileTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.threeMFFiles.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["threeMFFiles"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["models"]],
        });
        queryClient.invalidateQueries({
          queryKey: [["slicedFiles"]],
        });
      },
    }),
  );
}

// ===== FILES (Tagged Union System) =====

export function useFilesByEntityTRPC(
  entityType: "MODEL" | "THREE_MF" | "SLICED_FILE",
  entityId: number,
) {
  const trpc = useTRPC();
  return useQuery(trpc.files.byEntity.queryOptions({ entityType, entityId }));
}

export function useFileByIdTRPC(id: number) {
  const trpc = useTRPC();
  return useQuery(trpc.files.byId.queryOptions({ id }));
}

export function useFileStatsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.files.stats.queryOptions());
}

export function useCreateFileTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.files.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["files"]],
        });
      },
    }),
  );
}

export function useCreateManyFilesTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.files.createMany.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["files"]],
        });
      },
    }),
  );
}

export function useDeleteFilesTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.files.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["files"]],
        });
      },
    }),
  );
}

// ===== DASHBOARD =====

export function useDashboardAnalyticsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.analytics.queryOptions());
}

export function useDashboardOverviewTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.overview.queryOptions());
}

export function useDashboardInventoryTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.inventory.queryOptions());
}

export function useDashboardPrintStatsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.dashboard.printStats.queryOptions());
}

// ===== UTILITY DATA =====

export function useBrandsTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.brands.list.queryOptions());
}

export function useCreateBrandTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.brands.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["brands"]],
        });
      },
    }),
  );
}

export function useMaterialTypesTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.materialTypes.list.queryOptions());
}

export function useCreateMaterialTypeTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.materialTypes.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["materialTypes"]],
        });
      },
    }),
  );
}

export function useFilamentTypesTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.filamentTypes.list.queryOptions());
}

export function useCreateFilamentTypeTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.filamentTypes.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["filamentTypes"]],
        });
      },
    }),
  );
}

export function useModelCategoriesTRPC() {
  const trpc = useTRPC();
  return useQuery(trpc.modelCategories.list.queryOptions());
}

export function useCreateModelCategoryTRPC() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.modelCategories.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [["modelCategories"]],
        });
      },
    }),
  );
}
