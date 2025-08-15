import { Button } from "@/components/aria/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/aria/card";
import { Input } from "@/components/aria/input";
import { Label } from "@/components/aria/label";
import { Textarea } from "@/components/aria/textarea";
import { Switch } from "@/components/aria/switch";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { UserProfileResponse, UpdateProfileForm } from "@/lib/types";

interface ProfileInfoFormProps {
  userProfile: UserProfileResponse;
  onUpdate: (updatedProfile: Partial<UserProfileResponse>) => void;
}

export function ProfileInfoForm({ userProfile, onUpdate }: ProfileInfoFormProps) {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      name: userProfile.name || "",
      profile: {
        firstName: userProfile.profile.firstName || "",
        lastName: userProfile.profile.lastName || "",
        bio: userProfile.profile.bio || "",
        phoneNumber: userProfile.profile.phoneNumber || "",
        dateOfBirth: userProfile.profile.dateOfBirth || "",
        location: userProfile.profile.location || "",
        website: userProfile.profile.website || "",
        isPublic: userProfile.profile.isPublic || false,
      }
    } as UpdateProfileForm,
    onSubmit: async ({ value }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const response = await fetch('/api/users/me', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: value.name,
            profile: {
              firstName: value.profile?.firstName,
              lastName: value.profile?.lastName,
              bio: value.profile?.bio,
              phoneNumber: value.profile?.phoneNumber,
              dateOfBirth: value.profile?.dateOfBirth,
              location: value.profile?.location,
              website: value.profile?.website,
              isPublic: value.profile?.isPublic,
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        }

        const updatedProfile = await response.json();
        onUpdate(updatedProfile);
        setUpdateSuccess('Profile updated successfully!');
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your personal information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent>
        {updateError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{updateError}</p>
          </div>
        )}
        {updateSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{updateSuccess}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <div className="space-y-6">
            {/* Display Name */}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  if (!value || value.trim().length === 0) return "Display name is required";
                  if (value.length > 100) return "Display name must be less than 100 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Display Name</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your display name"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="profile.firstName"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 50) return "First name must be less than 50 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>First Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Your first name"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="profile.lastName"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 50) return "Last name must be less than 50 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Last Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Your last name"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Bio */}
            <form.Field
              name="profile.bio"
              validators={{
                onChange: ({ value }) => {
                  if (value && value.length > 500) return "Bio must be less than 500 characters";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Bio</Label>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="min-h-[100px]"
                  />
                  <p className="text-sm text-gray-500">
                    {field.state.value?.length || 0}/500 characters
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="profile.phoneNumber"
                validators={{
                  onChange: ({ value }) => {
                    if (value && !/^[\+]?[\s\-\(\)]*([0-9][\s\-\(\)]?){10,}$/.test(value)) {
                      return "Please enter a valid phone number";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Phone Number</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      type="tel"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="profile.dateOfBirth"
                validators={{
                  onChange: ({ value }) => {
                    if (value && new Date(value) > new Date()) {
                      return "Date of birth cannot be in the future";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Date of Birth</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="date"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Location and Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <form.Field
                name="profile.location"
                validators={{
                  onChange: ({ value }) => {
                    if (value && value.length > 100) return "Location must be less than 100 characters";
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Location</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="City, Country"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field
                name="profile.website"
                validators={{
                  onChange: ({ value }) => {
                    if (value && !/^https?:\/\/.+/.test(value)) {
                      return "Website must be a valid URL starting with http:// or https://";
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Website</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="https://yourwebsite.com"
                      type="url"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            {/* Privacy Settings */}
            <form.Field name="profile.isPublic">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={field.name}
                    isSelected={field.state.value}
                    onChange={(checked) => field.handleChange(checked)}
                  />
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    Make profile public
                  </Label>
                  <p className="text-sm text-gray-500 ml-2">
                    Allow others to view your profile information
                  </p>
                </div>
              )}
            </form.Field>

            {/* Submit Button */}
            <div className="flex justify-end">
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    isDisabled={!canSubmit}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}