import { useState } from 'react'
import {
  Button,
  FieldError,
  Form,
  Heading,
  Input,
  Label,
  TextField,
} from 'react-aria-components'
import { signIn } from '~/lib/auth-client'

interface LoginFormData {
  email: string
  password: string
}

export function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn.email({
        email: formData.email,
        password: formData.password,
      })

      // Redirect will be handled by BetterAuth
      console.log('Login successful')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Login failed. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Form onSubmit={handleSubmit} className="space-y-6">
        <Heading className="text-2xl font-bold text-center text-gray-900">
          Sign In
        </Heading>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <TextField
          name="email"
          type="email"
          isRequired
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
          className="space-y-1"
        >
          <Label className="block text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
          />
          <FieldError className="text-sm text-red-600" />
        </TextField>

        <TextField
          name="password"
          type="password"
          isRequired
          value={formData.password}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
          className="space-y-1"
        >
          <Label className="block text-sm font-medium text-gray-700">
            Password
          </Label>
          <Input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
          />
          <FieldError className="text-sm text-red-600" />
        </TextField>

        <Button
          type="submit"
          isDisabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a
              href="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </a>
          </span>
        </div>
      </Form>
    </div>
  )
}
