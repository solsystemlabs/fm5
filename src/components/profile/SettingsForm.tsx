import { Button } from "@/components/aria/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/aria/card";
import { Label } from "@/components/aria/label";
import { Switch } from "@/components/aria/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/aria/select";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { Settings, Bell, Eye, Globe, Palette, Mail } from "lucide-react";
import type { UserProfileResponse, UpdateSettingsForm } from "@/lib/types";

interface SettingsFormProps {
  userProfile: UserProfileResponse;
  onUpdate: (updatedSettings: Partial<UserProfileResponse['settings']>) => void;
}

export function SettingsForm({ userProfile, onUpdate }: SettingsFormProps) {
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      emailNotifications: userProfile.settings.emailNotifications,
      pushNotifications: userProfile.settings.pushNotifications,
      profileVisibility: userProfile.settings.profileVisibility,
      language: userProfile.settings.language,
      timezone: userProfile.settings.timezone,
      theme: userProfile.settings.theme,
      marketingEmails: userProfile.settings.marketingEmails,
    } as UpdateSettingsForm,
    onSubmit: async ({ value }) => {
      setUpdateError(null);
      setUpdateSuccess(null);

      try {
        const response = await fetch('/api/users/me/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update settings');
        }

        const updatedSettings = await response.json();
        onUpdate(updatedSettings);
        setUpdateSuccess('Settings updated successfully!');
      } catch (err) {
        setUpdateError(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    },
  });

  return (
    <div className="space-y-6">
      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {updateError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{updateError}</p>
            </div>
          )}
          {updateSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
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
              <form.Field name="emailNotifications">
                {(field) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      isSelected={field.state.value}
                      onChange={(isSelected) => field.handleChange(isSelected)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="pushNotifications">
                {(field) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Push Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive push notifications on your device
                      </p>
                    </div>
                    <Switch
                      isSelected={field.state.value}
                      onChange={(isSelected) => field.handleChange(isSelected)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="marketingEmails">
                {(field) => (
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 flex items-start gap-2">
                      <Mail className="h-5 w-5 mt-0.5 text-gray-500" />
                      <div>
                        <Label className="text-base">Marketing Emails</Label>
                        <p className="text-sm text-gray-500">
                          Receive updates about new features and promotions
                        </p>
                      </div>
                    </div>
                    <Switch
                      isSelected={field.state.value}
                      onChange={(isSelected) => field.handleChange(isSelected)}
                    />
                  </div>
                )}
              </form.Field>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Privacy
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form.Field name="profileVisibility">
            {(field) => (
              <div className="space-y-3">
                <Label className="text-base">Profile Visibility</Label>
                <Select
                  selectedKey={field.state.value}
                  onSelectionChange={(key) => field.handleChange(key as 'PUBLIC' | 'PRIVATE' | 'FRIENDS_ONLY')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="PUBLIC">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Public</p>
                          <p className="text-sm text-gray-500">Anyone can view your profile</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem id="FRIENDS_ONLY">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Friends Only</p>
                          <p className="text-sm text-gray-500">Only friends can view your profile</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem id="PRIVATE">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <div>
                          <p className="font-medium">Private</p>
                          <p className="text-sm text-gray-500">Only you can view your profile</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  This setting controls who can view your profile information and activity
                </p>
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize how the application looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form.Field name="theme">
            {(field) => (
              <div className="space-y-3">
                <Label className="text-base">Theme</Label>
                <Select
                  selectedKey={field.state.value}
                  onSelectionChange={(key) => field.handleChange(key as 'LIGHT' | 'DARK' | 'SYSTEM')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem id="LIGHT">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-white border rounded"></div>
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem id="DARK">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-900 border rounded"></div>
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem id="SYSTEM">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-white to-gray-900 border rounded"></div>
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.Field>
        </CardContent>
      </Card>

      {/* Localization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Set your language and timezone preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form.Field name="language">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-base">Language</Label>
                  <Select
                    selectedKey={field.state.value}
                    onSelectionChange={(key) => field.handleChange(key as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="en">English</SelectItem>
                      <SelectItem id="es">Español</SelectItem>
                      <SelectItem id="fr">Français</SelectItem>
                      <SelectItem id="de">Deutsch</SelectItem>
                      <SelectItem id="it">Italiano</SelectItem>
                      <SelectItem id="pt">Português</SelectItem>
                      <SelectItem id="zh">中文</SelectItem>
                      <SelectItem id="ja">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="timezone">
              {(field) => (
                <div className="space-y-3">
                  <Label className="text-base">Timezone</Label>
                  <Select
                    selectedKey={field.state.value}
                    onSelectionChange={(key) => field.handleChange(key as string)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem id="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem id="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem id="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem id="Europe/London">London (GMT)</SelectItem>
                      <SelectItem id="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem id="Europe/Berlin">Berlin (CET)</SelectItem>
                      <SelectItem id="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem id="Asia/Shanghai">Shanghai (CST)</SelectItem>
                      <SelectItem id="Australia/Sydney">Sydney (AEDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              onPress={() => form.handleSubmit()}
              isDisabled={!canSubmit}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );
}