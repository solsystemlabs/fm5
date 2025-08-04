import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/inventory/$item')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/inventory/$item"!</div>
}
