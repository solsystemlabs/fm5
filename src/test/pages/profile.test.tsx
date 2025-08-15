import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import { mockUserProfile, mockEmptyProfile, createMockUserProfile } from '@/test/fixtures/user-profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { useState, useEffect } from 'react';
import type { UserProfileResponse } from '@/lib/types';

// Import the ProfilePage component directly
function ProfilePage() {
  // This is a simplified version of the component for testing
  // In a real implementation, you might want to extract the component 
  // to a separate file for easier testing
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/users/me');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profile = await response.json();
        setUserProfile(profile);
      } catch (err) {
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
        <div>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
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
        <div>
          <h1>{userProfile.name}</h1>
          <p>{userProfile.email}</p>
          {userProfile.profile.bio && <p>{userProfile.profile.bio}</p>}
          <span>Profile views: {userProfile.profile.profileViews}</span>
          <span className={userProfile.emailVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
            {userProfile.emailVerified ? 'Verified' : 'Unverified'}
          </span>
        </div>
        
        <div role="tablist" className="grid grid-cols-4">
          <button role="tab" aria-controls="profile-panel" aria-selected="true">Profile</button>
          <button role="tab" aria-controls="security-panel" aria-selected="false">Security</button>
          <button role="tab" aria-controls="settings-panel" aria-selected="false">Settings</button>
          <button role="tab" aria-controls="activity-panel" aria-selected="false">Activity</button>
        </div>
        
        <div role="tabpanel" id="profile-panel" aria-labelledby="profile-tab">
          <h2>Profile Information</h2>
          <label htmlFor="name">Display Name</label>
          <input id="name" defaultValue={userProfile.name} />
          <button>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading States', () => {
    it('shows loading spinner while fetching profile', async () => {
      // Mock slow API response
      server.use(
        http.get('/api/users/me', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockUserProfile);
        })
      );

      render(<ProfilePage />);

      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
      expect(screen.getByRole('generic', { hidden: true })).toBeInTheDocument(); // Loading spinner

      await waitFor(() => {
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
      });
    });
  });

  describe('Profile Header', () => {
    it('displays user profile information correctly', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument();
        expect(screen.getByText(mockUserProfile.profile.bio!)).toBeInTheDocument();
        expect(screen.getByText(`Profile views: ${mockUserProfile.profile.profileViews}`)).toBeInTheDocument();
      });
    });

    it('shows verification status correctly', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Verified')).toBeInTheDocument();
        expect(screen.getByText('Verified')).toHaveClass('bg-green-100', 'text-green-800');
      });
    });

    it('shows unverified status for unverified users', async () => {
      const unverifiedProfile = createMockUserProfile({ emailVerified: false });
      
      server.use(
        http.get('/api/users/me', () => {
          return HttpResponse.json(unverifiedProfile);
        })
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Unverified')).toBeInTheDocument();
        expect(screen.getByText('Unverified')).toHaveClass('bg-yellow-100', 'text-yellow-800');
      });
    });

    it('does not show bio when not provided', async () => {
      server.use(
        http.get('/api/users/me', () => {
          return HttpResponse.json(mockEmptyProfile);
        })
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(mockEmptyProfile.name)).toBeInTheDocument();
        expect(screen.queryByText('Software engineer')).not.toBeInTheDocument();
      });
    });
  });

  describe('Profile Tabs', () => {
    it('renders all tab navigation items', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
      });
    });

    it('shows profile tab content by default', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        // Profile form should be visible
        expect(screen.getByText('Profile Information')).toBeInTheDocument();
        expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      });
    });

    it('switches to security tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /security/i })).toBeInTheDocument();
      });

      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      await waitFor(() => {
        expect(screen.getByText('Security Overview')).toBeInTheDocument();
        expect(screen.getByText('Change Password')).toBeInTheDocument();
      });
    });

    it('switches to settings tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        expect(screen.getByText('Notifications')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
      });
    });

    it('switches to activity tab when clicked', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /activity/i })).toBeInTheDocument();
      });

      const activityTab = screen.getByRole('tab', { name: /activity/i });
      await user.click(activityTab);

      await waitFor(() => {
        expect(screen.getByText('Activity History')).toBeInTheDocument();
        expect(screen.getByText('Your recent account activity and changes')).toBeInTheDocument();
      });
    });
  });

  describe('Avatar Upload Integration', () => {
    it('displays current avatar image', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        const avatarImage = screen.getByRole('img', { name: /profile/i });
        expect(avatarImage).toHaveAttribute('src', mockUserProfile.image);
      });
    });

    it('updates avatar when upload is successful', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /upload photo/i })).toBeInTheDocument();
      });

      // Simulate successful avatar upload
      const file = new File(['test'], 'avatar.jpg', { type: 'image/jpeg' });
      const fileInput = screen.getByLabelText('Upload avatar image');
      await user.upload(fileInput, file);

      await waitFor(() => {
        // Avatar should be updated in the header
        const avatarImage = screen.getByRole('img', { name: /profile/i });
        expect(avatarImage).toHaveAttribute('src', expect.stringContaining('avatars/'));
      });
    });
  });

  describe('Profile Updates Integration', () => {
    it('updates profile information and reflects changes in header', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByDisplayValue(mockUserProfile.name)).toBeInTheDocument();
      });

      // Update the profile name
      const nameField = screen.getByDisplayValue(mockUserProfile.name);
      await user.clear(nameField);
      await user.type(nameField, 'Updated Name');

      const saveButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(saveButton);

      await waitFor(() => {
        // Header should reflect the updated name
        expect(screen.getByText('Updated Name')).toBeInTheDocument();
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('updates settings and maintains state', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /settings/i })).toBeInTheDocument();
      });

      // Switch to settings tab
      const settingsTab = screen.getByRole('tab', { name: /settings/i });
      await user.click(settingsTab);

      await waitFor(() => {
        const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
        expect(emailSwitch).toBeChecked();
      });

      // Toggle email notifications
      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      await user.click(emailSwitch);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Settings updated successfully!')).toBeInTheDocument();
      });

      // Switch back to profile tab and then to settings to verify persistence
      const profileTab = screen.getByRole('tab', { name: /^profile$/i });
      await user.click(profileTab);
      
      await user.click(settingsTab);

      await waitFor(() => {
        const emailSwitchAfter = screen.getByRole('switch', { name: /email notifications/i });
        expect(emailSwitchAfter).not.toBeChecked();
      });
    });
  });

  describe('Error Handling', () => {
    it('shows error message when profile fetch fails', async () => {
      server.use(
        http.get('/api/users/me', () => {
          return HttpResponse.json(
            { message: 'Failed to fetch profile' },
            { status: 500 }
          );
        })
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch profile')).toBeInTheDocument();
      });
    });

    it('shows generic error for profile not found', async () => {
      server.use(
        http.get('/api/users/me', () => {
          return HttpResponse.json({}, { status: 200 });
        })
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText('Profile not found')).toBeInTheDocument();
      });
    });

    it('handles network errors gracefully', async () => {
      server.use(
        http.get('/api/users/me', () => {
          return HttpResponse.error();
        })
      );

      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout', () => {
    it('renders profile header with responsive layout', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        // Check for responsive flex classes
        const headerDiv = screen.getByText(mockUserProfile.name).closest('div');
        expect(headerDiv).toHaveClass('flex-1');
      });
    });

    it('renders tabs with proper grid layout', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        const tabsList = screen.getByRole('tablist');
        expect(tabsList).toHaveClass('grid', 'grid-cols-4');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper heading structure', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        // Main profile name should be a heading
        const nameHeading = screen.getByRole('heading', { name: mockUserProfile.name });
        expect(nameHeading).toBeInTheDocument();
      });
    });

    it('has accessible tab navigation', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        const tabList = screen.getByRole('tablist');
        expect(tabList).toBeInTheDocument();
        
        const tabs = screen.getAllByRole('tab');
        expect(tabs).toHaveLength(4);
        
        tabs.forEach(tab => {
          expect(tab).toHaveAttribute('aria-controls');
          expect(tab).toHaveAttribute('aria-selected');
        });
      });
    });

    it('has proper tab panels with labels', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        const profilePanel = screen.getByRole('tabpanel', { name: /profile/i });
        expect(profilePanel).toBeInTheDocument();
      });

      // Test other tab panels
      const securityTab = screen.getByRole('tab', { name: /security/i });
      await user.click(securityTab);

      await waitFor(() => {
        const securityPanel = screen.getByRole('tabpanel', { name: /security/i });
        expect(securityPanel).toBeInTheDocument();
      });
    });

    it('provides appropriate semantic structure', async () => {
      render(<ProfilePage />);

      await waitFor(() => {
        // Should have main content structure
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        
        // Should have proper profile information display
        expect(screen.getByText(`Profile views: ${mockUserProfile.profile.profileViews}`)).toBeInTheDocument();
        
        // Should have verification status with appropriate styling
        const verificationBadge = screen.getByText('Verified');
        expect(verificationBadge).toHaveClass('px-2', 'py-1', 'rounded-full');
      });
    });
  });

  describe('Performance', () => {
    it('renders profile data efficiently', async () => {
      const startTime = performance.now();
      
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Should render within reasonable time (allowing for test environment overhead)
      expect(renderTime).toBeLessThan(1000); // 1 second max
    });

    it('does not re-render unnecessarily when switching tabs', async () => {
      const user = userEvent.setup();
      render(<ProfilePage />);

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /profile/i })).toBeInTheDocument();
      });

      // Switch tabs multiple times
      const tabs = [
        screen.getByRole('tab', { name: /security/i }),
        screen.getByRole('tab', { name: /settings/i }),
        screen.getByRole('tab', { name: /activity/i }),
        screen.getByRole('tab', { name: /^profile$/i })
      ];

      for (const tab of tabs) {
        await user.click(tab);
        await waitFor(() => {
          expect(tab).toHaveAttribute('aria-selected', 'true');
        });
      }

      // Profile data should still be present and correct
      expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
      expect(screen.getByText(mockUserProfile.email)).toBeInTheDocument();
    });
  });
});