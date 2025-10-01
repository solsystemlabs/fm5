import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  compatibilityDate: '2025-09-24',
  // Force Prisma to use Node.js version instead of WASM version
  // even though we're targeting Cloudflare Workers, because we have nodejs_compat enabled
  alias: {
    '@prisma/client': '@prisma/client/index',
  },
  rollupConfig: {
    external: [/@prisma\/client/],
  },
})
