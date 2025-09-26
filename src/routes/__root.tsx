import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import * as React from 'react'

import Header from '../components/layout/Header'
import { TRPCProvider } from '../components/providers/TRPCProvider'

import appCss from '../styles.css?url'

export const Route = createRootRoute({
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
        title: 'FM5 - 3D Printing Management System',
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

/**
 * Root document component that provides the base HTML structure for the application.
 * @param props - Component props
 * @param props.children - Child components to render within the body
 * @returns JSX element containing the complete HTML document structure
 */

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TRPCProvider>
          <Header />
          {children}
          <TanStackRouterDevtools />
          <ReactQueryDevtools />
        </TRPCProvider>
        <Scripts />
      </body>
    </html>
  )
}
