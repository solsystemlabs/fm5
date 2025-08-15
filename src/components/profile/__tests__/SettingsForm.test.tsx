import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@/test/utils/test-utils';
import { SettingsForm } from '../SettingsForm';
import { mockUserProfile, createMockUserProfile } from '@/test/fixtures/user-profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('SettingsForm', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Rendering', () => {
    it('renders all settings sections', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Localization')).toBeInTheDocument();
    });

    it('renders notification settings with correct initial values', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      const pushSwitch = screen.getByRole('switch', { name: /push notifications/i });
      const marketingSwitch = screen.getByRole('switch', { name: /marketing emails/i });

      expect(emailSwitch).toBeChecked();
      expect(pushSwitch).not.toBeChecked();
      expect(marketingSwitch).not.toBeChecked();
    });

    it('renders privacy settings with correct initial value', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // The select should show the current value
      expect(screen.getByDisplayValue('PUBLIC')).toBeInTheDocument();
    });

    it('renders appearance settings with correct initial value', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // The theme select should show the current value
      expect(screen.getByDisplayValue('SYSTEM')).toBeInTheDocument();
    });

    it('renders localization settings with correct initial values', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // Language and timezone selects should show current values
      expect(screen.getByDisplayValue('en')).toBeInTheDocument();
      expect(screen.getByDisplayValue('America/Los_Angeles')).toBeInTheDocument();
    });
  });

  describe('Notification Settings', () => {
    it('toggles email notifications', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      expect(emailSwitch).toBeChecked();

      await user.click(emailSwitch);
      expect(emailSwitch).not.toBeChecked();

      await user.click(emailSwitch);
      expect(emailSwitch).toBeChecked();
    });

    it('toggles push notifications', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const pushSwitch = screen.getByRole('switch', { name: /push notifications/i });
      expect(pushSwitch).not.toBeChecked();

      await user.click(pushSwitch);
      expect(pushSwitch).toBeChecked();
    });

    it('toggles marketing emails', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const marketingSwitch = screen.getByRole('switch', { name: /marketing emails/i });
      expect(marketingSwitch).not.toBeChecked();

      await user.click(marketingSwitch);
      expect(marketingSwitch).toBeChecked();
    });

    it('shows descriptive text for notification options', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Receive notifications via email')).toBeInTheDocument();
      expect(screen.getByText('Receive push notifications on your device')).toBeInTheDocument();
      expect(screen.getByText('Receive updates about new features and promotions')).toBeInTheDocument();
    });
  });

  describe('Privacy Settings', () => {
    it('changes profile visibility to private', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const visibilitySelect = screen.getByRole('combobox', { name: /profile visibility/i });
      await user.click(visibilitySelect);
      
      const privateOption = screen.getByRole('option', { name: /private/i });
      await user.click(privateOption);

      expect(screen.getByDisplayValue('PRIVATE')).toBeInTheDocument();
    });

    it('changes profile visibility to friends only', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const visibilitySelect = screen.getByRole('combobox', { name: /profile visibility/i });
      await user.click(visibilitySelect);
      
      const friendsOption = screen.getByRole('option', { name: /friends only/i });
      await user.click(friendsOption);

      expect(screen.getByDisplayValue('FRIENDS_ONLY')).toBeInTheDocument();
    });

    it('shows privacy setting descriptions', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('This setting controls who can view your profile information and activity')).toBeInTheDocument();
    });
  });

  describe('Appearance Settings', () => {
    it('changes theme to dark', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      await user.click(themeSelect);
      
      const darkOption = screen.getByRole('option', { name: /dark/i });
      await user.click(darkOption);

      expect(screen.getByDisplayValue('DARK')).toBeInTheDocument();
    });

    it('changes theme to light', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      await user.click(themeSelect);
      
      const lightOption = screen.getByRole('option', { name: /light/i });
      await user.click(lightOption);

      expect(screen.getByDisplayValue('LIGHT')).toBeInTheDocument();
    });
  });

  describe('Localization Settings', () => {
    it('changes language setting', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const languageSelect = screen.getByRole('combobox', { name: /language/i });
      await user.click(languageSelect);
      
      const spanishOption = screen.getByRole('option', { name: /español/i });
      await user.click(spanishOption);

      expect(screen.getByDisplayValue('es')).toBeInTheDocument();
    });

    it('changes timezone setting', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const timezoneSelect = screen.getByRole('combobox', { name: /timezone/i });
      await user.click(timezoneSelect);
      
      const easternOption = screen.getByRole('option', { name: /eastern time/i });
      await user.click(easternOption);

      expect(screen.getByDisplayValue('America/New_York')).toBeInTheDocument();
    });

    it('shows multiple language options', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const languageSelect = screen.getByRole('combobox', { name: /language/i });
      await user.click(languageSelect);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Español')).toBeInTheDocument();
      expect(screen.getByText('Français')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
    });

    it('shows multiple timezone options', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const timezoneSelect = screen.getByRole('combobox', { name: /timezone/i });
      await user.click(timezoneSelect);

      expect(screen.getByText('Eastern Time (ET)')).toBeInTheDocument();
      expect(screen.getByText('Pacific Time (PT)')).toBeInTheDocument();
      expect(screen.getByText('London (GMT)')).toBeInTheDocument();
      expect(screen.getByText('Tokyo (JST)')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated settings', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // Toggle email notifications
      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      await user.click(emailSwitch);

      // Change theme
      const themeSelect = screen.getByRole('combobox', { name: /theme/i });
      await user.click(themeSelect);
      const darkOption = screen.getByRole('option', { name: /dark/i });
      await user.click(darkOption);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            emailNotifications: false,
            theme: 'DARK'
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      server.use(
        http.put('/api/users/me/settings', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockUserProfile.settings);
        })
      );

      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(saveButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Save Settings')).toBeInTheDocument();
      });
    });

    it('shows success message after successful update', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Settings updated successfully!')).toBeInTheDocument();
      });
    });

    it('shows error message on API failure', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      server.use(
        http.put('/api/users/me/settings', () => {
          return HttpResponse.json(
            { message: 'Failed to update settings' },
            { status: 500 }
          );
        })
      );

      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to update settings')).toBeInTheDocument();
      });
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      server.use(
        http.put('/api/users/me/settings', () => {
          return HttpResponse.error();
        })
      );

      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Complex Settings Scenarios', () => {
    it('updates multiple settings at once', async () => {
      const user = userEvent.setup();
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // Change multiple settings
      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      const pushSwitch = screen.getByRole('switch', { name: /push notifications/i });
      const marketingSwitch = screen.getByRole('switch', { name: /marketing emails/i });

      await user.click(emailSwitch); // false -> true
      await user.click(pushSwitch); // false -> true  
      await user.click(marketingSwitch); // false -> true

      // Change privacy setting
      const visibilitySelect = screen.getByRole('combobox', { name: /profile visibility/i });
      await user.click(visibilitySelect);
      const privateOption = screen.getByRole('option', { name: /private/i });
      await user.click(privateOption);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            emailNotifications: false, // Toggled from true
            pushNotifications: true,   // Toggled from false
            marketingEmails: true,     // Toggled from false
            profileVisibility: 'PRIVATE'
          })
        );
      });
    });

    it('preserves unchanged settings when submitting', async () => {
      const user = userEvent.setup();
      const customProfile = createMockUserProfile({
        settings: {
          ...mockUserProfile.settings,
          theme: 'DARK',
          language: 'es',
          timezone: 'Europe/London'
        }
      });

      render(<SettingsForm userProfile={customProfile} onUpdate={mockOnUpdate} />);

      // Only change one setting
      const emailSwitch = screen.getByRole('switch', { name: /email notifications/i });
      await user.click(emailSwitch);

      const saveButton = screen.getByRole('button', { name: /save settings/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            emailNotifications: false,
            theme: 'DARK',
            language: 'es',
            timezone: 'Europe/London',
            // Other settings should remain unchanged
            pushNotifications: customProfile.settings.pushNotifications,
            profileVisibility: customProfile.settings.profileVisibility,
            marketingEmails: customProfile.settings.marketingEmails
          })
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all settings', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // Notification switches should have accessible names
      expect(screen.getByRole('switch', { name: /email notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /push notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: /marketing emails/i })).toBeInTheDocument();

      // Select fields should have accessible names
      expect(screen.getByRole('combobox', { name: /profile visibility/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /theme/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /language/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /timezone/i })).toBeInTheDocument();
    });

    it('provides descriptive text for settings', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      expect(screen.getByText('Configure how you receive notifications')).toBeInTheDocument();
      expect(screen.getByText('Control who can see your profile information')).toBeInTheDocument();
      expect(screen.getByText('Customize how the application looks and feels')).toBeInTheDocument();
      expect(screen.getByText('Set your language and timezone preferences')).toBeInTheDocument();
    });

    it('has proper heading structure', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      expect(screen.getByRole('heading', { name: /notifications/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /privacy/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /appearance/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /localization/i })).toBeInTheDocument();
    });

    it('uses appropriate icons for visual clarity', () => {
      render(<SettingsForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />);

      // Icons should be present as visual indicators
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Localization')).toBeInTheDocument();
    });
  });
});