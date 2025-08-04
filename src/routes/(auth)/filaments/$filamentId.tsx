import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/filaments/$filamentId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/filaments/$filamentId"!</div>
}
