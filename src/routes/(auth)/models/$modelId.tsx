import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/models/$modelId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(auth)/models/$modelId"!</div>
}
