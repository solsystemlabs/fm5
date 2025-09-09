import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import React from 'react'

import Header from '../components/Header'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

import type { TRPCRouter } from '@/integrations/trpc/router'
import type { TRPCOptionsProxy } from '@trpc/tanstack-react-query'

interface MyRouterContext {
  queryClient: QueryClient

  trpc: TRPCOptionsProxy<TRPCRouter>
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'TanStack Start Starter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <Header />
        {children}
        {import.meta.env.DEV && <DevTools />}
        <Scripts />
      </body>
    </html>
  )
}

function DevTools() {
  const [devtools, setDevtools] = React.useState<{
    TanstackDevtools: any
    TanStackRouterDevtoolsPanel: any
    TanStackQueryDevtools: any
  } | null>(null)

  React.useEffect(() => {
    // Dynamically import devtools only in development
    Promise.all([
      import('@tanstack/react-devtools'),
      import('@tanstack/react-router-devtools'),
      import('../integrations/tanstack-query/devtools'),
    ]).then(([reactDevtools, routerDevtools, queryDevtools]) => {
      setDevtools({
        TanstackDevtools: reactDevtools.TanstackDevtools,
        TanStackRouterDevtoolsPanel: routerDevtools.TanStackRouterDevtoolsPanel,
        TanStackQueryDevtools: queryDevtools.default,
      })
    })
  }, [])

  if (!devtools) return null

  const { TanstackDevtools, TanStackRouterDevtoolsPanel, TanStackQueryDevtools } = devtools

  return (
    <TanstackDevtools
      config={{
        position: 'bottom-left',
      }}
      plugins={[
        {
          name: 'Tanstack Router',
          render: <TanStackRouterDevtoolsPanel />,
        },
        TanStackQueryDevtools,
      ]}
    />
  )
}
