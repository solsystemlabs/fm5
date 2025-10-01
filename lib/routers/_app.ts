import { createTRPCRouter } from '../trpc'
import { authRouter } from './auth'
import { modelsRouter } from './models'
import { variantsRouter } from './variants'
import { filamentsRouter } from './filaments'
import { queueRouter } from './queue'
import { devRouter } from './dev'

export const appRouter = createTRPCRouter({
  auth: authRouter,
  models: modelsRouter,
  variants: variantsRouter,
  filaments: filamentsRouter,
  queue: queueRouter,
  dev: devRouter,
})

// Export type definition of API
export type AppRouter = typeof appRouter
