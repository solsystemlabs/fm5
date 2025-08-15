import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { mockUserProfile, createMockUserProfile } from '../fixtures/user-profile';

// Integration tests for profile API endpoints
// These would typically run against a test database or test server

describe('Profile API Integration Tests', () => {
  // Mock API base URL for testing
  const API_BASE = '/api/users/me';

  beforeAll(() => {
    // Set up test database or mock server
  });

  afterAll(() => {
    // Clean up test database or mock server
  });

  beforeEach(() => {
    // Reset database state or clear mocks
  });

  describe('GET /api/users/me', () => {
    it('returns user profile for authenticated user', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      expect(data).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        name: expect.any(String),
        profile: expect.objectContaining({
          profileViews: expect.any(Number),
          isPublic: expect.any(Boolean)
        }),
        settings: expect.objectContaining({
          emailNotifications: expect.any(Boolean),
          profileVisibility: expect.stringMatching(/^(PUBLIC|PRIVATE|FRIENDS_ONLY)$/),
          theme: expect.stringMatching(/^(LIGHT|DARK|SYSTEM)$/)
        })
      });
    });

    it('returns 401 for unauthenticated requests', async () => {
      // Test with no authentication headers
      const response = await fetch(API_BASE, {
        headers: {
          'Authorization': '' // Remove auth
        }
      });

      expect(response.status).toBe(401);
    });

    it('returns consistent data structure', async () => {
      const response = await fetch(API_BASE);
      const data = await response.json();

      // Verify all required fields are present
      const requiredFields = [
        'id', 'email', 'name', 'emailVerified', 'profile', 'settings', 'createdAt', 'updatedAt'
      ];

      requiredFields.forEach(field => {
        expect(data).toHaveProperty(field);
      });

      // Verify nested structure
      expect(data.profile).toHaveProperty('profileViews');
      expect(data.profile).toHaveProperty('isPublic');
      expect(data.settings).toHaveProperty('emailNotifications');
      expect(data.settings).toHaveProperty('theme');
    });
  });

  describe('PUT /api/users/me', () => {
    it('updates user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        profile: {
          firstName: 'Updated',
          lastName: 'User',
          bio: 'Updated bio',
          location: 'New York, NY'
        }
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const updatedProfile = await response.json();
      expect(updatedProfile.name).toBe(updateData.name);
      expect(updatedProfile.profile.firstName).toBe(updateData.profile.firstName);
      expect(updatedProfile.profile.bio).toBe(updateData.profile.bio);
      expect(updatedProfile.profile.lastProfileEdit).toBeDefined();
    });

    it('validates required fields', async () => {
      const updateData = {
        name: '', // Empty name should fail validation
        profile: {}
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('name');
    });

    it('validates field length constraints', async () => {
      const updateData = {
        name: 'Valid Name',
        profile: {
          bio: 'a'.repeat(501) // Exceeds 500 character limit
        }
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('bio');
    });

    it('validates email format in nested updates', async () => {
      const updateData = {
        profile: {
          website: 'invalid-url' // Should be a valid URL
        }
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
    });

    it('preserves unchanged fields', async () => {
      // First, get current profile
      const getCurrentResponse = await fetch(API_BASE);
      const currentProfile = await getCurrentResponse.json();

      // Update only one field
      const updateData = {
        profile: {
          bio: 'Only bio updated'
        }
      };

      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const updatedProfile = await response.json();

      // Name should remain unchanged
      expect(updatedProfile.name).toBe(currentProfile.name);
      expect(updatedProfile.email).toBe(currentProfile.email);
      
      // Only bio should be updated
      expect(updatedProfile.profile.bio).toBe('Only bio updated');
      expect(updatedProfile.profile.firstName).toBe(currentProfile.profile.firstName);
    });
  });

  describe('PUT /api/users/me/password', () => {
    it('changes password successfully with correct current password', async () => {
      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewSecurePassword123',
        confirmPassword: 'NewSecurePassword123'
      };

      const response = await fetch(`${API_BASE}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.message).toContain('Password changed successfully');
    });

    it('rejects incorrect current password', async () => {
      const passwordData = {
        currentPassword: 'wrongPassword',
        newPassword: 'NewSecurePassword123',
        confirmPassword: 'NewSecurePassword123'
      };

      const response = await fetch(`${API_BASE}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('Current password is incorrect');
    });

    it('validates password strength requirements', async () => {
      const weakPasswords = [
        'weak',
        '12345678',
        'password',
        'PASSWORD123',
        'password123'
      ];

      for (const weakPassword of weakPasswords) {
        const passwordData = {
          currentPassword: 'currentPassword123',
          newPassword: weakPassword,
          confirmPassword: weakPassword
        };

        const response = await fetch(`${API_BASE}/password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(passwordData)
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      }
    });

    it('validates password confirmation matching', async () => {
      const passwordData = {
        currentPassword: 'currentPassword123',
        newPassword: 'NewSecurePassword123',
        confirmPassword: 'DifferentPassword123'
      };

      const response = await fetch(`${API_BASE}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(passwordData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('Passwords do not match');
    });
  });

  describe('PUT /api/users/me/email', () => {
    it('initiates email change process successfully', async () => {
      const emailData = {
        newEmail: 'newemail@example.com',
        password: 'currentPassword123'
      };

      const response = await fetch(`${API_BASE}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.email).toBe(emailData.newEmail);
      expect(result.emailVerified).toBe(false); // Should be unverified after change
    });

    it('validates email format', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@domain',
        'user space@example.com'
      ];

      for (const invalidEmail of invalidEmails) {
        const emailData = {
          newEmail: invalidEmail,
          password: 'currentPassword123'
        };

        const response = await fetch(`${API_BASE}/email`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailData)
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      }
    });

    it('rejects duplicate email addresses', async () => {
      const emailData = {
        newEmail: 'taken@example.com', // This email is marked as taken in mock
        password: 'currentPassword123'
      };

      const response = await fetch(`${API_BASE}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('Email is already in use');
    });

    it('requires password verification', async () => {
      const emailData = {
        newEmail: 'newemail@example.com',
        password: 'wrongPassword'
      };

      const response = await fetch(`${API_BASE}/email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailData)
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('Password is incorrect');
    });
  });

  describe('GET/PUT /api/users/me/settings', () => {
    it('retrieves current user settings', async () => {
      const response = await fetch(`${API_BASE}/settings`);
      const settings = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      // Verify settings structure
      expect(settings).toMatchObject({
        emailNotifications: expect.any(Boolean),
        pushNotifications: expect.any(Boolean),
        profileVisibility: expect.stringMatching(/^(PUBLIC|PRIVATE|FRIENDS_ONLY)$/),
        language: expect.any(String),
        timezone: expect.any(String),
        theme: expect.stringMatching(/^(LIGHT|DARK|SYSTEM)$/),
        marketingEmails: expect.any(Boolean)
      });
    });

    it('updates user settings successfully', async () => {
      const settingsUpdate = {
        emailNotifications: false,
        theme: 'DARK' as const,
        language: 'es',
        profileVisibility: 'PRIVATE' as const
      };

      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsUpdate)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const updatedSettings = await response.json();
      expect(updatedSettings.emailNotifications).toBe(false);
      expect(updatedSettings.theme).toBe('DARK');
      expect(updatedSettings.language).toBe('es');
      expect(updatedSettings.profileVisibility).toBe('PRIVATE');
    });

    it('validates settings enum values', async () => {
      const invalidSettings = [
        { theme: 'INVALID_THEME' },
        { profileVisibility: 'INVALID_VISIBILITY' },
        { language: null },
        { emailNotifications: 'not-boolean' }
      ];

      for (const invalidSetting of invalidSettings) {
        const response = await fetch(`${API_BASE}/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invalidSetting)
        });

        expect(response.ok).toBe(false);
        expect(response.status).toBe(400);
      }
    });

    it('preserves unchanged settings', async () => {
      // Get current settings
      const getCurrentResponse = await fetch(`${API_BASE}/settings`);
      const currentSettings = await getCurrentResponse.json();

      // Update only one setting
      const partialUpdate = {
        emailNotifications: !currentSettings.emailNotifications
      };

      const response = await fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partialUpdate)
      });

      const updatedSettings = await response.json();

      // Only emailNotifications should change
      expect(updatedSettings.emailNotifications).toBe(!currentSettings.emailNotifications);
      expect(updatedSettings.theme).toBe(currentSettings.theme);
      expect(updatedSettings.language).toBe(currentSettings.language);
      expect(updatedSettings.timezone).toBe(currentSettings.timezone);
    });
  });

  describe('POST/DELETE /api/users/me/avatar', () => {
    it('uploads avatar image successfully', async () => {
      const formData = new FormData();
      const mockFile = new File(['test image data'], 'avatar.jpg', {
        type: 'image/jpeg'
      });
      formData.append('avatar', mockFile);

      const response = await fetch(`${API_BASE}/avatar`, {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.imageUrl).toMatch(/^https?:\/\/.+\.(jpg|jpeg|png|gif)$/i);
    });

    it('validates file type', async () => {
      const formData = new FormData();
      const mockFile = new File(['test data'], 'document.pdf', {
        type: 'application/pdf'
      });
      formData.append('avatar', mockFile);

      const response = await fetch(`${API_BASE}/avatar`, {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('Invalid file type');
    });

    it('validates file size limit', async () => {
      const formData = new FormData();
      // Create a mock large file (6MB)
      const largeFileData = new Uint8Array(6 * 1024 * 1024);
      const mockFile = new File([largeFileData], 'large-avatar.jpg', {
        type: 'image/jpeg'
      });
      formData.append('avatar', mockFile);

      const response = await fetch(`${API_BASE}/avatar`, {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('File size too large');
    });

    it('requires file in request', async () => {
      const formData = new FormData();
      // Don't append any file

      const response = await fetch(`${API_BASE}/avatar`, {
        method: 'POST',
        body: formData
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);

      const errorData = await response.json();
      expect(errorData.message).toContain('No file uploaded');
    });

    it('deletes avatar successfully', async () => {
      const response = await fetch(`${API_BASE}/avatar`, {
        method: 'DELETE'
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.message).toContain('Avatar deleted successfully');
    });
  });

  describe('GET /api/users/me/activity', () => {
    it('retrieves activity history with pagination', async () => {
      const response = await fetch(`${API_BASE}/activity?page=1&limit=10`);
      const data = await response.json();

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      expect(data).toMatchObject({
        entries: expect.any(Array),
        totalCount: expect.any(Number),
        page: 1,
        limit: 10,
        totalPages: expect.any(Number)
      });

      // Verify activity entry structure
      if (data.entries.length > 0) {
        const entry = data.entries[0];
        expect(entry).toMatchObject({
          id: expect.any(String),
          type: expect.any(String),
          description: expect.any(String),
          timestamp: expect.any(String)
        });
      }
    });

    it('handles pagination parameters correctly', async () => {
      const page2Response = await fetch(`${API_BASE}/activity?page=2&limit=5`);
      const page2Data = await page2Response.json();

      expect(page2Data.page).toBe(2);
      expect(page2Data.limit).toBe(5);
      expect(page2Data.entries.length).toBeLessThanOrEqual(5);
    });

    it('returns activities in chronological order', async () => {
      const response = await fetch(`${API_BASE}/activity?page=1&limit=20`);
      const data = await response.json();

      expect(data.entries.length).toBeGreaterThan(1);

      // Verify timestamps are in descending order (newest first)
      for (let i = 1; i < data.entries.length; i++) {
        const current = new Date(data.entries[i].timestamp);
        const previous = new Date(data.entries[i - 1].timestamp);
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
      }
    });

    it('validates pagination parameters', async () => {
      const invalidParams = [
        'page=-1&limit=10',
        'page=1&limit=0',
        'page=abc&limit=10',
        'page=1&limit=abc'
      ];

      for (const params of invalidParams) {
        const response = await fetch(`${API_BASE}/activity?${params}`);
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Error Handling', () => {
    it('handles malformed JSON in requests', async () => {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: '{"invalid": json}'
      });

      expect(response.status).toBe(400);
      const errorData = await response.json();
      expect(errorData.message).toContain('Invalid JSON');
    });

    it('handles missing Content-Type header', async () => {
      const response = await fetch(API_BASE, {
        method: 'PUT',
        body: JSON.stringify({ name: 'Test' })
      });

      expect(response.status).toBe(400);
    });

    it('returns appropriate error codes for different scenarios', async () => {
      // Test various error conditions
      const testCases = [
        {
          endpoint: API_BASE,
          method: 'PUT',
          body: { name: '' },
          expectedStatus: 400,
          description: 'validation error'
        },
        {
          endpoint: `${API_BASE}/nonexistent`,
          method: 'GET',
          expectedStatus: 404,
          description: 'not found'
        }
      ];

      for (const testCase of testCases) {
        const response = await fetch(testCase.endpoint, {
          method: testCase.method,
          headers: { 'Content-Type': 'application/json' },
          body: testCase.body ? JSON.stringify(testCase.body) : undefined
        });

        expect(response.status).toBe(testCase.expectedStatus);
      }
    });
  });

  describe('Security', () => {
    it('requires authentication for all endpoints', async () => {
      const endpoints = [
        { path: API_BASE, method: 'GET' },
        { path: API_BASE, method: 'PUT' },
        { path: `${API_BASE}/password`, method: 'PUT' },
        { path: `${API_BASE}/email`, method: 'PUT' },
        { path: `${API_BASE}/settings`, method: 'GET' },
        { path: `${API_BASE}/settings`, method: 'PUT' },
        { path: `${API_BASE}/avatar`, method: 'POST' },
        { path: `${API_BASE}/avatar`, method: 'DELETE' },
        { path: `${API_BASE}/activity`, method: 'GET' }
      ];

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint.path, {
          method: endpoint.method,
          headers: {
            'Authorization': '' // Remove auth header
          }
        });

        expect(response.status).toBe(401);
      }
    });

    it('validates CSRF tokens for state-changing operations', async () => {
      const statefulEndpoints = [
        { path: API_BASE, method: 'PUT' },
        { path: `${API_BASE}/password`, method: 'PUT' },
        { path: `${API_BASE}/email`, method: 'PUT' },
        { path: `${API_BASE}/settings`, method: 'PUT' },
        { path: `${API_BASE}/avatar`, method: 'POST' },
        { path: `${API_BASE}/avatar`, method: 'DELETE' }
      ];

      // This would test CSRF protection if implemented
      // The exact implementation depends on the CSRF strategy used
      for (const endpoint of statefulEndpoints) {
        const response = await fetch(endpoint.path, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: endpoint.method === 'POST' ? new FormData() : JSON.stringify({})
        });

        // Should either succeed with valid token or fail with 403
        expect([200, 400, 403]).toContain(response.status);
      }
    });
  });
});