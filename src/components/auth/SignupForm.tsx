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
import { signUp } from '~/lib/auth-client'

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      await signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name,
      })

      console.log('Signup successful')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Signup failed. Please try again.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Form onSubmit={handleSubmit} className="space-y-6">
        <Heading className="text-2xl font-bold text-center text-gray-900">
          Create Account
        </Heading>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <TextField
          name="name"
          type="text"
          isRequired
          value={formData.name}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, name: value }))
          }
          className="space-y-1"
        >
          <Label className="block text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your full name"
          />
          <FieldError className="text-sm text-red-600" />
        </TextField>

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
            placeholder="Choose a secure password"
          />
          <FieldError className="text-sm text-red-600" />
        </TextField>

        <TextField
          name="confirmPassword"
          type="password"
          isRequired
          value={formData.confirmPassword}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, confirmPassword: value }))
          }
          className="space-y-1"
        >
          <Label className="block text-sm font-medium text-gray-700">
            Confirm Password
          </Label>
          <Input
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your password"
          />
          <FieldError className="text-sm text-red-600" />
        </TextField>

        <Button
          type="submit"
          isDisabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>

        <div className="text-center">
          <span className="text-sm text-gray-600">
            Already have an account?{' '}
            <a
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </a>
          </span>
        </div>
      </Form>
    </div>
  )
}
