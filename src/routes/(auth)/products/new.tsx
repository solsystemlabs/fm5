import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/products/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/products/new"!</div>
}
