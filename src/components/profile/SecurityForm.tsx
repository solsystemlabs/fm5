import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Shield, Mail, Key } from "lucide-react";
import type { UserProfileResponse, ChangePasswordForm, ChangeEmailForm } from "@/lib/types";
import { authClient } from "@/lib/auth-client";

interface SecurityFormProps {
  userProfile: UserProfileResponse;
}

export function SecurityForm({ userProfile }: SecurityFormProps) {
  return (
    <div className="space-y-6">
      {/* Current Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>
            Your account security status and recent changes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-sm text-gray-600">
                  Current email: {userProfile.email}
                </p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                userProfile.emailVerified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {userProfile.emailVerified ? 'Verified' : 'Unverified'}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-gray-600">
                  Last changed on {new Date(userProfile.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800">
                Secure
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <ChangePasswordCard />

      {/* Change Email */}
      <ChangeEmailCard currentEmail={userProfile.email} />
    </div>
  );
}

function ChangePasswordCard() {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const passwordForm = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } as ChangePasswordForm,
    onSubmit: async ({ value }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      if (value.newPassword !== value.confirmPassword) {
        setUpdateError("New passwords do not match");
        return;
      }

      try {
        const result = await authClient.changePassword({
          currentPassword: value.currentPassword,
          newPassword: value.newPassword,
          revokeOtherSessions: false,
        });

        if (result.error) {
          throw new Error(result.error.message || 'Failed to update password');
        }

        setUpdateSuccess('Password updated successfully!');
        passwordForm.reset();
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          Change Password
        </CardTitle>
        <CardDescription>
          Update your account password to keep your account secure
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
            passwordForm.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <passwordForm.Field
              name="currentPassword"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Current password is required";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Current Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    placeholder="Enter current password"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </passwordForm.Field>

            <passwordForm.Field
              name="newPassword"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "New password is required";
                  if (value.length < 8) return "Password must be at least 8 characters";
                  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return "Password must contain uppercase, lowercase, and number";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    placeholder="Enter new password"
                  />
                  <p className="text-sm text-gray-500">
                    Password must be at least 8 characters and contain uppercase, lowercase, and number
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </passwordForm.Field>

            <passwordForm.Field
              name="confirmPassword"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Please confirm your new password";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Confirm New Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    placeholder="Confirm new password"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </passwordForm.Field>

            <div className="flex justify-end">
              <passwordForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="min-w-[140px]"
                  >
                    {isSubmitting ? "Updating..." : "Update Password"}
                  </Button>
                )}
              </passwordForm.Subscribe>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function ChangeEmailCard({ currentEmail }: { currentEmail: string }) {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const emailForm = useForm({
    defaultValues: {
      newEmail: "",
      password: "",
    } as ChangeEmailForm,
    onSubmit: async ({ value }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const response = await fetch('/api/users/me/email', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update email');
        }

        setUpdateSuccess('Email change request sent! Please check your new email to confirm the change.');
        emailForm.reset();
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Change Email
        </CardTitle>
        <CardDescription>
          Update your account email address. You'll need to verify the new email.
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

        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <strong>Current email:</strong> {currentEmail}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            emailForm.handleSubmit();
          }}
        >
          <div className="space-y-4">
            <emailForm.Field
              name="newEmail"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "New email is required";
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return "Please enter a valid email address";
                  }
                  if (value === currentEmail) return "New email must be different from current email";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>New Email</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="email"
                    placeholder="Enter new email address"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </emailForm.Field>

            <emailForm.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value) return "Password is required to change email";
                  return undefined;
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Current Password</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    type="password"
                    placeholder="Enter your current password"
                  />
                  <p className="text-sm text-gray-500">
                    We need your current password to confirm this change
                  </p>
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-sm text-red-600">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </emailForm.Field>

            <div className="flex justify-end">
              <emailForm.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? "Updating..." : "Update Email"}
                  </Button>
                )}
              </emailForm.Subscribe>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}