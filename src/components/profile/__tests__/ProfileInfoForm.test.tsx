import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockFetch, fillFormField, expectFormError, expectSubmitDisabled, expectSubmitEnabled } from '@/test/utils/test-utils';
import { ProfileInfoForm } from '../ProfileInfoForm';
import { mockUserProfile, mockEmptyProfile, createMockUserProfile } from '@/test/fixtures/user-profile';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';

describe('ProfileInfoForm', () => {
  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  describe('Rendering', () => {
    it('renders form with pre-filled user data', () => {
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByDisplayValue(mockUserProfile.name)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.firstName!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.lastName!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.bio!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.phoneNumber!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.location!)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockUserProfile.profile.website!)).toBeInTheDocument();
    });

    it('renders form with empty profile data', () => {
      render(
        <ProfileInfoForm userProfile={mockEmptyProfile} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByDisplayValue(mockEmptyProfile.name)).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your first name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Your last name')).toHaveValue('');
      expect(screen.getByPlaceholderText('Tell us about yourself...')).toHaveValue('');
    });

    it('shows correct privacy switch state', () => {
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const privacySwitch = screen.getByRole('switch', { name: /make profile public/i });
      expect(privacySwitch).toBeChecked();
    });

    it('shows bio character count', () => {
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByText(`${mockUserProfile.profile.bio!.length}/500 characters`)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('validates required display name', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const nameField = screen.getByDisplayValue(mockUserProfile.name);
      await user.clear(nameField);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'name', 'Display name is required');
      });
      expectSubmitDisabled(container);
    });

    it('validates display name length', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const nameField = screen.getByDisplayValue(mockUserProfile.name);
      const longName = 'a'.repeat(101);
      
      await user.clear(nameField);
      await user.type(nameField, longName);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'name', 'Display name must be less than 100 characters');
      });
      expectSubmitDisabled(container);
    });

    it('validates first name length', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const firstNameField = screen.getByDisplayValue(mockUserProfile.profile.firstName!);
      const longName = 'a'.repeat(51);
      
      await user.clear(firstNameField);
      await user.type(firstNameField, longName);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'firstName', 'First name must be less than 50 characters');
      });
      expectSubmitDisabled(container);
    });

    it('validates bio length', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const bioField = screen.getByDisplayValue(mockUserProfile.profile.bio!);
      const longBio = 'a'.repeat(501);
      
      await user.clear(bioField);
      await user.type(bioField, longBio);

      await waitFor(() => {
        expectFormError(container, 'bio', 'Bio must be less than 500 characters');
      });
      expectSubmitDisabled(container);
    });

    it('validates phone number format', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const phoneField = screen.getByDisplayValue(mockUserProfile.profile.phoneNumber!);
      
      await user.clear(phoneField);
      await user.type(phoneField, 'invalid-phone');
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'phoneNumber', 'Please enter a valid phone number');
      });
      expectSubmitDisabled(container);
    });

    it('accepts valid phone number formats', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockEmptyProfile} onUpdate={mockOnUpdate} />
      );

      const phoneField = screen.getByPlaceholderText('+1 (555) 123-4567');
      const validNumbers = [
        '+1 (555) 123-4567',
        '555-123-4567',
        '5551234567',
        '+44 20 7946 0958'
      ];

      for (const number of validNumbers) {
        await user.clear(phoneField);
        await user.type(phoneField, number);
        await user.tab();
        
        // Should not show validation error
        const errorElement = container.querySelector(`[name="phoneNumber"] + p`);
        expect(errorElement).not.toHaveTextContent('Please enter a valid phone number');
      }
    });

    it('validates date of birth cannot be in future', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const dobField = screen.getByDisplayValue(mockUserProfile.profile.dateOfBirth!);
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];
      
      await user.clear(dobField);
      await user.type(dobField, futureDateString);
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'dateOfBirth', 'Date of birth cannot be in the future');
      });
      expectSubmitDisabled(container);
    });

    it('validates website URL format', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const websiteField = screen.getByDisplayValue(mockUserProfile.profile.website!);
      
      await user.clear(websiteField);
      await user.type(websiteField, 'invalid-url');
      await user.tab();

      await waitFor(() => {
        expectFormError(container, 'website', 'Website must be a valid URL starting with http:// or https://');
      });
      expectSubmitDisabled(container);
    });

    it('accepts valid website URLs', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <ProfileInfoForm userProfile={mockEmptyProfile} onUpdate={mockOnUpdate} />
      );

      const websiteField = screen.getByPlaceholderText('https://yourwebsite.com');
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://subdomain.example.com/path'
      ];

      for (const url of validUrls) {
        await user.clear(websiteField);
        await user.type(websiteField, url);
        await user.tab();
        
        // Should not show validation error
        const errorElement = container.querySelector(`[name="website"] + p`);
        expect(errorElement).not.toHaveTextContent('Website must be a valid URL');
      }
    });
  });

  describe('Form Submission', () => {
    it('submits form with updated data', async () => {
      const user = userEvent.setup();
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const nameField = screen.getByDisplayValue(mockUserProfile.name);
      const bioField = screen.getByDisplayValue(mockUserProfile.profile.bio!);
      
      await user.clear(nameField);
      await user.type(nameField, 'Updated Name');
      
      await user.clear(bioField);
      await user.type(bioField, 'Updated bio');

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Name',
            profile: expect.objectContaining({
              bio: 'Updated bio'
            })
          })
        );
      });
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      
      // Mock slow API response
      server.use(
        http.put('/api/users/me', async () => {
          await new Promise(resolve => setTimeout(resolve, 100));
          return HttpResponse.json(mockUserProfile);
        })
      );

      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.getByText('Save Changes')).toBeInTheDocument();
      });
    });

    it('shows success message after successful update', async () => {
      const user = userEvent.setup();
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('shows error message on API failure', async () => {
      const user = userEvent.setup();
      
      // Mock API error
      server.use(
        http.put('/api/users/me', () => {
          return HttpResponse.json(
            { message: 'Server error occurred' },
            { status: 500 }
          );
        })
      );

      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });

    it('handles network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      server.use(
        http.put('/api/users/me', () => {
          return HttpResponse.error();
        })
      );

      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const submitButton = screen.getByRole('button', { name: /save changes/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for all form fields', () => {
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      expect(screen.getByLabelText('Display Name')).toBeInTheDocument();
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Bio')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone Number')).toBeInTheDocument();
      expect(screen.getByLabelText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByLabelText('Location')).toBeInTheDocument();
      expect(screen.getByLabelText('Website')).toBeInTheDocument();
      expect(screen.getByLabelText('Make profile public')).toBeInTheDocument();
    });

    it('associates error messages with form fields', async () => {
      const user = userEvent.setup();
      render(
        <ProfileInfoForm userProfile={mockUserProfile} onUpdate={mockOnUpdate} />
      );

      const nameField = screen.getByDisplayValue(mockUserProfile.name);
      await user.clear(nameField);
      await user.tab();

      await waitFor(() => {
        const errorMessage = screen.getByText('Display name is required');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });
  });
});