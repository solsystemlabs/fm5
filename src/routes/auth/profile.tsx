import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '~/src/components/auth/UserProfile'

export const Route = createFileRoute('/auth/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <UserProfile />
    </div>
  )
}
