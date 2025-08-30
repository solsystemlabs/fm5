import { router } from './init';
import { filamentsRouter } from './routers/filaments';
import { modelsRouter } from './routers/models';
import { utilitiesRouter } from './routers/utilities';
import { productsRouter } from './routers/products';
import { slicedFilesRouter } from './routers/sliced-files';
import { threeMFFilesRouter } from './routers/threemf-files';
import { filesRouter } from './routers/files';
import { dashboardRouter } from './routers/dashboard';
import { downloadsRouter } from './routers/downloads';

export const appRouter = router({
  filaments: filamentsRouter,
  models: modelsRouter,
  products: productsRouter,
  slicedFiles: slicedFilesRouter,
  threeMFFiles: threeMFFilesRouter,
  files: filesRouter,
  dashboard: dashboardRouter,
  downloads: downloadsRouter,
  
  // Utility routers
  brands: utilitiesRouter.brands,
  materialTypes: utilitiesRouter.materialTypes,
  filamentTypes: utilitiesRouter.filamentTypes,
  modelCategories: utilitiesRouter.modelCategories,
});

export type AppRouter = typeof appRouter;