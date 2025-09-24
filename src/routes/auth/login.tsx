import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '~/src/components/auth/LoginForm'

export const Route = createFileRoute('/auth/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            FM5 - Filament Manager
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            3D Printing Business Management Platform
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
