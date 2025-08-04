import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/filaments/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/filaments/"!</div>
}
