// @ts-ignore Env
let cachedEnv: Env | null = null

// This gets called once at startup when running locally
const initDevEnv = async () => {
  const { getPlatformProxy } = await import('wrangler')
  const proxy = await getPlatformProxy()
  // @ts-ignore Env
  cachedEnv = proxy.env as unknown as Env
}

if (import.meta.env.DEV) {
  await initDevEnv()
}

/**
 * Will only work when being accessed on the server. Obviously, CF bindings are not available in the browser.
 * @returns
 */
// @ts-ignore Env
export function getBindings(): Env {
  if (import.meta.env.DEV) {
    if (!cachedEnv) {
      throw new Error(
        'Dev bindings not initialized yet. Call initDevEnv() first.',
      )
    }
    return cachedEnv
  }

  // @ts-ignore Env
  return process.env as unknown as Env
}
