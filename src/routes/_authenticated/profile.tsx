import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/aria/card';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { User, Shield, Settings, Activity } from 'lucide-react';
import { useState, useEffect, createContext, useContext } from 'react';
import type { UserProfileResponse } from '@/lib/types';

type ProfileContextType = {
  userProfile: UserProfileResponse;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfileResponse | null>>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileLayout');
  }
  return context;
};

export const Route = createFileRoute('/_authenticated/profile')({
  component: ProfileLayout,
  loader: async () => {
    const response = await fetch('/api/users/me', {
      credentials: 'include'
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Please log in to view your profile');
      }
      const errorData = await response.text();
      console.error('API Error:', response.status, errorData);
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }
    
    const userProfile = await response.json();
    return { userProfile };
  },
  beforeLoad: ({ context }) => {
    console.log('Profile beforeLoad context:', context);
    return {
      // We can add additional context here if needed
      profileLoaded: true,
    };
  },
});

function ProfileLayout() {
  console.log('ProfileLayout rendering...');
  const location = useLocation();
  const loaderData = Route.useLoaderData();
  const context = Route.useRouteContext();
  
  // Use loader data if available, otherwise fall back to context user
  let profileData;
  
  if (loaderData && loaderData.userProfile) {
    profileData = loaderData.userProfile;
  } else if (context && context.user) {
    profileData = {
      ...context.user,
      profile: {
        bio: context.user.bio || '',
        profileViews: 0,
      },
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
        profileVisibility: 'public'
      }
    };
  }
  
  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Profile not found</p>
      </div>
    );
  }

  const tabs = [
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/profile/security', label: 'Security', icon: Shield },
    { path: '/profile/settings', label: 'Settings', icon: Settings },
    { path: '/profile/activity', label: 'Activity', icon: Activity },
  ];

  return (
    <ProfileContext.Provider value={{ userProfile: profileData, setUserProfile: setProfileData }}>
      <div className="container mx-auto py-6 max-w-4xl">
        <div className="flex flex-col gap-6">
          {/* Profile Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <AvatarUpload
                  currentImage={profileData.image}
                  onUploadSuccess={(imageUrl) => {
                    setProfileData(prev => prev ? { ...prev, image: imageUrl } : null);
                  }}
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl">{profileData.name}</CardTitle>
                  <CardDescription className="text-lg">{profileData.email}</CardDescription>
                  {profileData.profile.bio && (
                    <p className="mt-2 text-gray-600">{profileData.profile.bio}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>Profile views: {profileData.profile.profileViews}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      profileData.emailVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {profileData.emailVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Profile navigation">
              {tabs.map(({ path, label, icon: Icon }) => {
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Route Content */}
          <div className="space-y-4">
            <Outlet />
          </div>
        </div>
      </div>
    </ProfileContext.Provider>
  );
}