import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from './router';

// Export type helpers for client-side usage
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Specific procedure input/output types for common use cases
export type FilamentInput = RouterInputs['filaments']['create'];
export type FilamentOutput = NonNullable<RouterOutputs['filaments']['list']>[0];
export type FilamentListOutput = RouterOutputs['filaments']['list'];

export type ModelInput = RouterInputs['models']['create'];
export type ModelOutput = NonNullable<RouterOutputs['models']['list']>[0];
export type ModelListOutput = RouterOutputs['models']['list'];
export type ModelFilesOutput = RouterOutputs['models']['files'];

export type SlicedFileInput = RouterInputs['slicedFiles']['create'];
export type SlicedFileOutput = NonNullable<RouterOutputs['slicedFiles']['list']>[0];
export type SlicedFileListOutput = RouterOutputs['slicedFiles']['list'];

export type ThreeMFFileOutput = NonNullable<RouterOutputs['threeMFFiles']['list']>[0];
export type ThreeMFFileListOutput = RouterOutputs['threeMFFiles']['list'];

// Utility types
export type BrandOutput = NonNullable<RouterOutputs['brands']['list']>[0];
export type MaterialTypeOutput = NonNullable<RouterOutputs['materialTypes']['list']>[0];
export type FilamentTypeOutput = NonNullable<RouterOutputs['filamentTypes']['list']>[0];
export type ModelCategoryOutput = NonNullable<RouterOutputs['modelCategories']['list']>[0];

// Dashboard types
export type DashboardAnalyticsOutput = RouterOutputs['dashboard']['analytics'];
export type DashboardOverviewOutput = RouterOutputs['dashboard']['overview'];

// Product types
export type ProductInput = RouterInputs['products']['create'];
export type ProductOutput = NonNullable<RouterOutputs['products']['list']>[0];
export type ProductListOutput = RouterOutputs['products']['list'];