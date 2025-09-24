import { useEffect, useState } from 'react'
import {
  Button,
  FieldError,
  Form,
  Heading,
  Input,
  Label,
  TextField,
} from 'react-aria-components'
import { signOut, useSession } from '~/lib/auth-client'
import { api } from '~/lib/api'

interface ProfileFormData {
  name: string
  businessName: string
  businessDescription: string
}

export function UserProfile() {
  const { data: session, isPending } = useSession()
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    businessName: '',
    businessDescription: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Get user profile data
  const { data: userProfile, isLoading: isProfileLoading } =
    api.auth.me.useQuery(undefined, { enabled: !!session?.user })

  // Update profile mutation
  const updateProfileMutation = api.auth.updateProfile.useMutation({
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setMessage(null), 3000)
    },
    onError: (error) => {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update profile',
      })
    },
  })

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        businessName: userProfile.businessName || '',
        businessDescription: userProfile.businessDescription || '',
      })
    }
  }, [userProfile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name,
        businessName: formData.businessName,
        businessDescription: formData.businessDescription,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  if (isPending || isProfileLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6 text-center">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Heading className="text-3xl font-bold text-gray-900">
          User Profile
        </Heading>
        <Button
          onPress={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Sign Out
        </Button>
      </div>

      {message && (
        <div
          className={`p-3 mb-6 text-sm rounded-md ${
            message.type === 'success'
              ? 'text-green-600 bg-green-50 border border-green-200'
              : 'text-red-600 bg-red-50 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <Form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Account Information
              </h3>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Email:</span> {userProfile?.email}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Email Verified:</span>{' '}
                {userProfile?.emailVerified ? (
                  <span className="text-green-600">✓ Verified</span>
                ) : (
                  <span className="text-yellow-600">⚠ Not verified</span>
                )}
              </p>
            </div>

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
                placeholder="Your full name"
              />
              <FieldError className="text-sm text-red-600" />
            </TextField>

            <TextField
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, businessName: value }))
              }
              className="space-y-1"
            >
              <Label className="block text-sm font-medium text-gray-700">
                Business Name <span className="text-gray-500">(optional)</span>
              </Label>
              <Input
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your business or organization name"
              />
              <FieldError className="text-sm text-red-600" />
            </TextField>

            <TextField
              name="businessDescription"
              type="text"
              value={formData.businessDescription}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, businessDescription: value }))
              }
              className="space-y-1"
            >
              <Label className="block text-sm font-medium text-gray-700">
                Business Description{' '}
                <span className="text-gray-500">(optional)</span>
              </Label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
                placeholder="Brief description of your business or services"
                value={formData.businessDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    businessDescription: e.target.value,
                  }))
                }
              />
              <FieldError className="text-sm text-red-600" />
            </TextField>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              isDisabled={isLoading || updateProfileMutation.isPending}
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || updateProfileMutation.isPending
                ? 'Saving...'
                : 'Save Changes'}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  )
}
