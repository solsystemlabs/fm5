import { http, HttpResponse } from 'msw';
import type { UserProfileResponse, UpdateProfileForm, ChangePasswordForm, ChangeEmailForm, UpdateSettingsForm, ActivityEntry } from '@/lib/types';
import { mockUserProfile, mockActivityEntries } from '../fixtures/user-profile';

export const handlers = [
  // Auth endpoints
  http.get('/api/auth/get-session', () => {
    return HttpResponse.json({
      user: {
        id: mockUserProfile.id,
        email: mockUserProfile.email,
        name: mockUserProfile.name
      },
      session: { id: 'session_123' }
    });
  }),
  // GET /api/users/me - Get current user profile
  http.get('/api/users/me', () => {
    return HttpResponse.json(mockUserProfile);
  }),

  // PUT /api/users/me - Update profile
  http.put('/api/users/me', async ({ request }) => {
    const updateData = await request.json() as UpdateProfileForm;
    
    const updatedProfile: UserProfileResponse = {
      ...mockUserProfile,
      name: updateData.name || mockUserProfile.name,
      profile: {
        ...mockUserProfile.profile,
        ...updateData.profile,
        lastProfileEdit: new Date().toISOString()
      }
    };

    return HttpResponse.json(updatedProfile);
  }),

  // PUT /api/users/me/password - Change password
  http.put('/api/users/me/password', async ({ request }) => {
    const passwordData = await request.json() as ChangePasswordForm;
    
    // Simulate password validation
    if (passwordData.currentPassword !== 'currentPassword123') {
      return HttpResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return HttpResponse.json(
        { message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // PUT /api/users/me/email - Change email
  http.put('/api/users/me/email', async ({ request }) => {
    const emailData = await request.json() as ChangeEmailForm;
    
    // Simulate password validation
    if (emailData.password !== 'currentPassword123') {
      return HttpResponse.json(
        { message: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    if (emailData.newEmail === 'taken@example.com') {
      return HttpResponse.json(
        { message: 'Email is already in use' },
        { status: 400 }
      );
    }

    const updatedProfile: UserProfileResponse = {
      ...mockUserProfile,
      email: emailData.newEmail,
      emailVerified: false
    };

    return HttpResponse.json(updatedProfile);
  }),

  // GET /api/users/me/settings - Get user settings
  http.get('/api/users/me/settings', () => {
    return HttpResponse.json(mockUserProfile.settings);
  }),

  // PUT /api/users/me/settings - Update settings
  http.put('/api/users/me/settings', async ({ request }) => {
    const settingsData = await request.json() as UpdateSettingsForm;
    
    const updatedSettings = {
      ...mockUserProfile.settings,
      ...settingsData
    };

    return HttpResponse.json(updatedSettings);
  }),

  // POST /api/users/me/avatar - Upload avatar
  http.post('/api/users/me/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('avatar') as File;
    
    if (!file) {
      return HttpResponse.json(
        { message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Simulate file size validation
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return HttpResponse.json(
        { message: 'File size too large. Maximum size is 5MB' },
        { status: 400 }
      );
    }

    // Simulate file type validation
    if (!file.type.startsWith('image/')) {
      return HttpResponse.json(
        { message: 'Invalid file type. Only images are allowed' },
        { status: 400 }
      );
    }

    const imageUrl = `https://example.com/avatars/${Date.now()}-${file.name}`;
    
    return HttpResponse.json({ imageUrl });
  }),

  // DELETE /api/users/me/avatar - Delete avatar
  http.delete('/api/users/me/avatar', () => {
    return HttpResponse.json({ message: 'Avatar deleted successfully' });
  }),

  // GET /api/users/me/activity - Get activity history
  http.get('/api/users/me/activity', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = mockActivityEntries.slice(startIndex, endIndex);
    const totalPages = Math.ceil(mockActivityEntries.length / limit);
    
    return HttpResponse.json({
      activities: paginatedEntries,  // Changed from 'entries' to 'activities'
      totalCount: mockActivityEntries.length,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    });
  }),
];

// Error handlers for testing error scenarios
export const errorHandlers = [
  // Server error handler
  http.get('/api/users/me', () => {
    return HttpResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Unauthorized handler
  http.get('/api/users/me-unauthorized', () => {
    return HttpResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }),

  // Network error handler
  http.get('/api/users/me-network-error', () => {
    return HttpResponse.error();
  })
];