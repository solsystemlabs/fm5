import { router } from './init';
import { filamentsRouter } from './routers/filaments';
import { modelsRouter } from './routers/models';
import { utilitiesRouter } from './routers/utilities';
import { productsRouter } from './routers/products';
import { slicedFilesRouter } from './routers/sliced-files';

export const appRouter = router({
  filaments: filamentsRouter,
  models: modelsRouter,
  products: productsRouter,
  slicedFiles: slicedFilesRouter,
  
  // Utility routers
  brands: utilitiesRouter.brands,
  materialTypes: utilitiesRouter.materialTypes,
  filamentTypes: utilitiesRouter.filamentTypes,
  modelCategories: utilitiesRouter.modelCategories,
});

export type AppRouter = typeof appRouter;