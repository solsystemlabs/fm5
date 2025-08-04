import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/products/$productId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/products/$productId"!</div>
}
