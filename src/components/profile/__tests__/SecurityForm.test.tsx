import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, expectFormError, expectSubmitDisabled } from '@/test/utils/test-utils';
import { SecurityForm } from '../SecurityForm';
import { mockUserProfile, createMockUserProfile } from '@/test/fixtures/user-profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('SecurityForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Security Overview', () => {
    it('displays current security status', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText('Security Overview')).toBeInTheDocument();
      expect(screen.getByText(`Current email: ${mockUserProfile.email}`)).toBeInTheDocument();
      expect(screen.getByText('Verified')).toBeInTheDocument();
      expect(screen.getByText('Secure')).toBeInTheDocument();
    });

    it('shows unverified status for unverified email', () => {
      const unverifiedProfile = createMockUserProfile({ emailVerified: false });
      render(<SecurityForm userProfile={unverifiedProfile} />);

      expect(screen.getByText('Unverified')).toBeInTheDocument();
      expect(screen.getByText('Unverified')).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });

    it('displays last password change date', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      const lastChangedDate = new Date(mockUserProfile.updatedAt).toLocaleDateString();
      expect(screen.getByText(`Last changed on ${lastChangedDate}`)).toBeInTheDocument();
    });
  });

  describe('Change Password Form', () => {
    it('renders password change form', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText('Change Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
    });

    it('validates current password is required', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const currentPasswordField = screen.getByLabelText('Current Password');
      await user.click(currentPasswordField);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'currentPassword', 'Current password is required');
      });
    });

    it('validates new password requirements', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const newPasswordField = screen.getByLabelText('New Password');
      
      // Test empty password
      await user.click(newPasswordField);
      await user.tab();
      await waitFor(() => {
        expectFormError(container, 'newPassword', 'New password is required');
      });

      // Test short password
      await user.clear(newPasswordField);
      await user.type(newPasswordField, '12345');
      await user.tab();
      await waitFor(() => {
        expectFormError(container, 'newPassword', 'Password must be at least 8 characters');
      });

      // Test password without uppercase
      await user.clear(newPasswordField);
      await user.type(newPasswordField, 'password123');
      await user.tab();
      await waitFor(() => {
        expectFormError(container, 'newPassword', 'Password must contain uppercase, lowercase, and number');
      });

      // Test password without lowercase
      await user.clear(newPasswordField);
      await user.type(newPasswordField, 'PASSWORD123');
      await user.tab();
      await waitFor(() => {
        expectFormError(container, 'newPassword', 'Password must contain uppercase, lowercase, and number');
      });

      // Test password without number
      await user.clear(newPasswordField);
      await user.type(newPasswordField, 'Password');
      await user.tab();
      await waitFor(() => {
        expectFormError(container, 'newPassword', 'Password must contain uppercase, lowercase, and number');
      });
    });

    it('accepts valid password', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const newPasswordField = screen.getByLabelText('New Password');
      await user.type(newPasswordField, 'Password123');
      await user.tab();

      // Should not show validation error
      const errorElement = container.querySelector(`[name="newPassword"] + p + p`);
      expect(errorElement).not.toHaveTextContent('Password must contain uppercase, lowercase, and number');
    });

    it('validates password confirmation is required', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const confirmPasswordField = screen.getByLabelText('Confirm New Password');
      await user.click(confirmPasswordField);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'confirmPassword', 'Please confirm your new password');
      });
    });

    it('validates passwords match on form submission', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      await user.type(screen.getByLabelText('Current Password'), 'currentPassword123');
      await user.type(screen.getByLabelText('New Password'), 'NewPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'DifferentPassword123');

      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
      });
    });

    it('shows password requirements help text', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText(
        'Password must be at least 8 characters and contain uppercase, lowercase, and number'
      )).toBeInTheDocument();
    });

    it('submits password change successfully', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      await user.type(screen.getByLabelText('Current Password'), 'currentPassword123');
      await user.type(screen.getByLabelText('New Password'), 'NewPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPassword123');

      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password updated successfully!')).toBeInTheDocument();
      });

      // Form should be reset
      expect(screen.getByLabelText('Current Password')).toHaveValue('');
      expect(screen.getByLabelText('New Password')).toHaveValue('');
      expect(screen.getByLabelText('Confirm New Password')).toHaveValue('');
    });

    it('shows loading state during password change', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.put('/api/users/me/password', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ message: 'Success' });
        })
      );

      render(<SecurityForm userProfile={mockUserProfile} />);

      await user.type(screen.getByLabelText('Current Password'), 'currentPassword123');
      await user.type(screen.getByLabelText('New Password'), 'NewPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPassword123');

      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);

      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Update Password')).toBeInTheDocument();
      });
    });

    it('handles incorrect current password error', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      await user.type(screen.getByLabelText('Current Password'), 'wrongPassword');
      await user.type(screen.getByLabelText('New Password'), 'NewPassword123');
      await user.type(screen.getByLabelText('Confirm New Password'), 'NewPassword123');

      const submitButton = screen.getByRole('button', { name: /update password/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Current password is incorrect')).toBeInTheDocument();
      });
    });
  });

  describe('Change Email Form', () => {
    it('renders email change form', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText('Change Email')).toBeInTheDocument();
      expect(screen.getByLabelText('New Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update email/i })).toBeInTheDocument();
    });

    it('displays current email information', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText(`Current email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('validates new email is required', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      await user.click(newEmailField);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'newEmail', 'New email is required');
      });
    });

    it('validates email format', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      await user.type(newEmailField, 'invalid-email');
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'newEmail', 'Please enter a valid email address');
      });
    });

    it('validates email is different from current', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      await user.type(newEmailField, mockUserProfile.email);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'newEmail', 'New email must be different from current email');
      });
    });

    it('validates password is required for email change', async () => {
      const user = userEvent.setup();
      const { container } = render(<SecurityForm userProfile={mockUserProfile} />);

      // There are two password fields - we want the one in the email form
      const passwordFields = screen.getAllByLabelText('Current Password');
      const emailPasswordField = passwordFields[1]; // Second one is for email change
      
      await user.click(emailPasswordField);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'password', 'Password is required to change email');
      });
    });

    it('shows password confirmation help text', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText('We need your current password to confirm this change')).toBeInTheDocument();
    });

    it('submits email change successfully', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      const passwordFields = screen.getAllByLabelText('Current Password');
      const emailPasswordField = passwordFields[1];

      await user.type(newEmailField, 'newemail@example.com');
      await user.type(emailPasswordField, 'currentPassword123');

      const submitButton = screen.getByRole('button', { name: /update email/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(
          'Email change request sent! Please check your new email to confirm the change.'
        )).toBeInTheDocument();
      });

      // Form should be reset
      expect(newEmailField).toHaveValue('');
      expect(emailPasswordField).toHaveValue('');
    });

    it('shows loading state during email change', async () => {
      const user = userEvent.setup();
      
      server.use(
        http.put('/api/users/me/email', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json({ message: 'Success' });
        })
      );

      render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      const passwordFields = screen.getAllByLabelText('Current Password');
      const emailPasswordField = passwordFields[1];

      await user.type(newEmailField, 'newemail@example.com');
      await user.type(emailPasswordField, 'currentPassword123');

      const submitButton = screen.getByRole('button', { name: /update email/i });
      await user.click(submitButton);

      expect(screen.getByText('Updating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Update Email')).toBeInTheDocument();
      });
    });

    it('handles email already taken error', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      const passwordFields = screen.getAllByLabelText('Current Password');
      const emailPasswordField = passwordFields[1];

      await user.type(newEmailField, 'taken@example.com');
      await user.type(emailPasswordField, 'currentPassword123');

      const submitButton = screen.getByRole('button', { name: /update email/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is already in use')).toBeInTheDocument();
      });
    });

    it('handles incorrect password for email change', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      const newEmailField = screen.getByLabelText('New Email');
      const passwordFields = screen.getAllByLabelText('Current Password');
      const emailPasswordField = passwordFields[1];

      await user.type(newEmailField, 'newemail@example.com');
      await user.type(emailPasswordField, 'wrongPassword');

      const submitButton = screen.getByRole('button', { name: /update email/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password is incorrect')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper headings structure', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByRole('heading', { name: /security overview/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /change password/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /change email/i })).toBeInTheDocument();
    });

    it('has proper labels for all form fields', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      // Password form labels
      expect(screen.getAllByLabelText('Current Password')).toHaveLength(2);
      expect(screen.getByLabelText('New Password')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
      
      // Email form labels
      expect(screen.getByLabelText('New Email')).toBeInTheDocument();
    });

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      render(<SecurityForm userProfile={mockUserProfile} />);

      const newPasswordField = screen.getByLabelText('New Password');
      await user.click(newPasswordField);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText('New password is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('provides descriptive help text', () => {
      render(<SecurityForm userProfile={mockUserProfile} />);

      expect(screen.getByText(
        'Password must be at least 8 characters and contain uppercase, lowercase, and number'
      )).toBeInTheDocument();
      expect(screen.getByText('We need your current password to confirm this change')).toBeInTheDocument();
    });
  });
});