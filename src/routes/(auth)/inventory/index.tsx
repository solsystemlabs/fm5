import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/inventory/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/inventory/"!</div>
}
