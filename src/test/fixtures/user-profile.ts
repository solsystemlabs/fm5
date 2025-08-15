import type { UserProfileResponse, ActivityEntry } from '@/lib/types';

export const mockUserProfile: UserProfileResponse = {
  id: 'user_123',
  email: 'john.doe@example.com',
  name: 'John Doe',
  image: 'https://example.com/avatars/john-doe.jpg',
  emailVerified: true,
  profile: {
    bio: 'Software engineer passionate about 3D printing and technology',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1 (555) 123-4567',
    dateOfBirth: '1990-05-15',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    profileViews: 42,
    isPublic: true,
    lastProfileEdit: '2024-01-15T10:30:00Z'
  },
  settings: {
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'PUBLIC',
    language: 'en',
    timezone: 'America/Los_Angeles',
    theme: 'SYSTEM',
    marketingEmails: false
  },
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2024-01-15T10:30:00Z'
};

export const mockEmptyProfile: UserProfileResponse = {
  id: 'user_456',
  email: 'jane.smith@example.com',
  name: 'Jane Smith',
  emailVerified: false,
  profile: {
    profileViews: 0,
    isPublic: false
  },
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    profileVisibility: 'PRIVATE',
    language: 'en',
    timezone: 'UTC',
    theme: 'LIGHT',
    marketingEmails: false
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
};

export const mockActivityEntries: ActivityEntry[] = [
  {
    id: 'activity_1',
    type: 'profile_update',
    description: 'Updated profile information',
    timestamp: '2024-01-15T10:30:00Z',
    metadata: {
      fields: ['firstName', 'lastName', 'bio']
    }
  },
  {
    id: 'activity_2',
    type: 'password_change',
    description: 'Changed account password',
    timestamp: '2024-01-10T14:20:00Z'
  },
  {
    id: 'activity_3',
    type: 'email_change',
    description: 'Changed email address',
    timestamp: '2024-01-05T09:15:00Z',
    metadata: {
      previousEmail: 'old.email@example.com',
      newEmail: 'john.doe@example.com'
    }
  },
  {
    id: 'activity_4',
    type: 'settings_update',
    description: 'Updated account settings',
    timestamp: '2024-01-03T16:45:00Z',
    metadata: {
      settings: ['emailNotifications', 'theme']
    }
  },
  {
    id: 'activity_5',
    type: 'avatar_upload',
    description: 'Uploaded new profile picture',
    timestamp: '2024-01-02T12:00:00Z'
  },
  {
    id: 'activity_6',
    type: 'login',
    description: 'Signed in to account',
    timestamp: '2024-01-01T08:30:00Z',
    metadata: {
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...'
    }
  }
];

// Factory functions for creating test data variations
export const createMockUserProfile = (overrides: Partial<UserProfileResponse> = {}): UserProfileResponse => ({
  ...mockUserProfile,
  ...overrides,
  profile: {
    ...mockUserProfile.profile,
    ...overrides.profile
  },
  settings: {
    ...mockUserProfile.settings,
    ...overrides.settings
  }
});

export const createMockActivityEntry = (overrides: Partial<ActivityEntry> = {}): ActivityEntry => ({
  id: `activity_${Date.now()}`,
  type: 'test_activity',
  description: 'Test activity entry',
  timestamp: new Date().toISOString(),
  ...overrides
});