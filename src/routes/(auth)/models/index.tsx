import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/models/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/models/"!</div>
}
