import { createFileRoute, redirect } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProfileInfoForm } from '@/components/profile/ProfileInfoForm';
import { SecurityForm } from '@/components/profile/SecurityForm';
import { SettingsForm } from '@/components/profile/SettingsForm';
import { ActivityHistory } from '@/components/profile/ActivityHistory';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { User, Shield, Settings, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { UserProfileResponse } from '@/lib/types';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/_auth/profile')({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    
    if (!session?.data?.session) {
      // User is not logged in, redirect to login
      throw redirect({ to: '/login', search: { redirect: '/profile' } });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include' // Ensure cookies are sent
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Please log in to view your profile');
          }
          const errorData = await response.text();
          console.error('API Error:', response.status, errorData);
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const profile = await response.json();
        setUserProfile(profile);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="flex flex-col gap-6">
        {/* Profile Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <AvatarUpload
                currentImage={userProfile.image}
                onUploadSuccess={(imageUrl) => {
                  setUserProfile(prev => prev ? { ...prev, image: imageUrl } : null);
                }}
              />
              <div className="flex-1">
                <CardTitle className="text-2xl">{userProfile.name}</CardTitle>
                <CardDescription className="text-lg">{userProfile.email}</CardDescription>
                {userProfile.profile.bio && (
                  <p className="mt-2 text-gray-600">{userProfile.profile.bio}</p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>Profile views: {userProfile.profile.profileViews}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    userProfile.emailVerified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {userProfile.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Profile Tabs */}
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4">
            <ProfileInfoForm
              userProfile={userProfile}
              onUpdate={(updatedProfile) => {
                setUserProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
              }}
            />
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <SecurityForm userProfile={userProfile} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <SettingsForm
              userProfile={userProfile}
              onUpdate={(updatedSettings) => {
                setUserProfile(prev => prev ? { 
                  ...prev, 
                  settings: { ...prev.settings, ...updatedSettings }
                } : null);
              }}
            />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <ActivityHistory userId={userProfile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}