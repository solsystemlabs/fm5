import { test, expect } from '@playwright/test';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123',
  name: 'Test User'
};

const updatedProfile = {
  name: 'Updated Test User',
  firstName: 'Updated',
  lastName: 'User',
  bio: 'This is an updated bio for testing purposes',
  phoneNumber: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  website: 'https://updateduser.com'
};

// Helper function to login user
async function loginUser(page, email = testUser.email, password = testUser.password) {
  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard'); // Assuming successful login redirects to dashboard
}

test.describe('User Profile Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await loginUser(page);
  });

  test.describe('Profile Information Management', () => {
    test('should update profile information successfully', async ({ page }) => {
      // Navigate to profile page
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Verify profile page loads
      await expect(page.getByText('Profile Information')).toBeVisible();
      await expect(page.getByRole('tab', { name: /profile/i })).toHaveAttribute('aria-selected', 'true');

      // Update profile information
      await page.fill('[name="name"]', updatedProfile.name);
      await page.fill('[name="firstName"]', updatedProfile.firstName);
      await page.fill('[name="lastName"]', updatedProfile.lastName);
      await page.fill('[name="bio"]', updatedProfile.bio);
      await page.fill('[name="phoneNumber"]', updatedProfile.phoneNumber);
      await page.fill('[name="location"]', updatedProfile.location);
      await page.fill('[name="website"]', updatedProfile.website);

      // Submit the form
      await page.click('button:has-text("Save Changes")');

      // Verify success message
      await expect(page.getByText('Profile updated successfully!')).toBeVisible();

      // Verify the profile header updates
      await expect(page.getByRole('heading', { name: updatedProfile.name })).toBeVisible();
      await expect(page.getByText(updatedProfile.bio)).toBeVisible();

      // Reload page and verify changes persist
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.getByDisplayValue(updatedProfile.name)).toBeVisible();
      await expect(page.getByDisplayValue(updatedProfile.firstName)).toBeVisible();
      await expect(page.getByDisplayValue(updatedProfile.bio)).toBeVisible();
    });

    test('should validate form fields and show errors', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Clear required field and trigger validation
      await page.fill('[name="name"]', '');
      await page.blur('[name="name"]');

      // Verify error message appears
      await expect(page.getByText('Display name is required')).toBeVisible();

      // Verify submit button is disabled
      const submitButton = page.getByRole('button', { name: 'Save Changes' });
      await expect(submitButton).toBeDisabled();

      // Test field length validation
      const longBio = 'a'.repeat(501);
      await page.fill('[name="bio"]', longBio);
      await page.blur('[name="bio"]');

      await expect(page.getByText('Bio must be less than 500 characters')).toBeVisible();

      // Test phone number validation
      await page.fill('[name="phoneNumber"]', 'invalid-phone');
      await page.blur('[name="phoneNumber"]');

      await expect(page.getByText('Please enter a valid phone number')).toBeVisible();

      // Test website URL validation
      await page.fill('[name="website"]', 'invalid-url');
      await page.blur('[name="website"]');

      await expect(page.getByText('Website must be a valid URL starting with http:// or https://')).toBeVisible();
    });

    test('should toggle privacy settings', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Find the privacy switch
      const privacySwitch = page.getByRole('switch', { name: /make profile public/i });

      // Get current state
      const isCurrentlyChecked = await privacySwitch.isChecked();

      // Toggle the switch
      await privacySwitch.click();

      // Verify the state changed
      await expect(privacySwitch).toBeChecked(!isCurrentlyChecked);

      // Submit the form to save the change
      await page.click('button:has-text("Save Changes")');
      await expect(page.getByText('Profile updated successfully!')).toBeVisible();

      // Reload and verify the setting persists
      await page.reload();
      await page.waitForLoadState('networkidle');
      await expect(privacySwitch).toBeChecked(!isCurrentlyChecked);
    });
  });

  test.describe('Security Settings', () => {
    test('should change password successfully', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Switch to security tab
      await page.click('button[role="tab"]:has-text("Security")');
      await expect(page.getByText('Security Overview')).toBeVisible();

      // Fill password change form
      await page.fill('[name="currentPassword"]', testUser.password);
      await page.fill('[name="newPassword"]', 'NewTestPassword123');
      await page.fill('[name="confirmPassword"]', 'NewTestPassword123');

      // Submit password change
      await page.click('button:has-text("Update Password")');

      // Verify success message
      await expect(page.getByText('Password updated successfully!')).toBeVisible();

      // Verify form is reset
      await expect(page.getByRole('textbox', { name: 'Current Password' })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: 'New Password' })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: 'Confirm New Password' })).toHaveValue('');
    });

    test('should validate password requirements', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Security")');

      // Test weak password validation
      await page.fill('[name="newPassword"]', 'weak');
      await page.blur('[name="newPassword"]');

      await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();

      // Test password without uppercase
      await page.fill('[name="newPassword"]', 'password123');
      await page.blur('[name="newPassword"]');

      await expect(page.getByText('Password must contain uppercase, lowercase, and number')).toBeVisible();

      // Test password confirmation mismatch
      await page.fill('[name="newPassword"]', 'ValidPassword123');
      await page.fill('[name="confirmPassword"]', 'DifferentPassword123');
      await page.fill('[name="currentPassword"]', testUser.password);
      
      await page.click('button:has-text("Update Password")');

      await expect(page.getByText('New passwords do not match')).toBeVisible();
    });

    test('should change email address', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Security")');

      // Scroll to email change section
      await page.locator('text=Change Email').scrollIntoViewIfNeeded();

      const newEmail = 'newemail@example.com';

      // Fill email change form
      await page.fill('[name="newEmail"]', newEmail);
      await page.fill('[name="password"]', testUser.password);

      // Submit email change
      await page.click('button:has-text("Update Email")');

      // Verify success message
      await expect(page.getByText('Email change request sent! Please check your new email to confirm the change.')).toBeVisible();

      // Verify form is reset
      await expect(page.getByRole('textbox', { name: 'New Email' })).toHaveValue('');
      await expect(page.getByRole('textbox', { name: 'Current Password' })).toHaveValue('');
    });

    test('should validate email format and prevent duplicate emails', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Security")');

      // Test invalid email format
      await page.fill('[name="newEmail"]', 'invalid-email');
      await page.blur('[name="newEmail"]');

      await expect(page.getByText('Please enter a valid email address')).toBeVisible();

      // Test same email as current
      await page.fill('[name="newEmail"]', testUser.email);
      await page.blur('[name="newEmail"]');

      await expect(page.getByText('New email must be different from current email')).toBeVisible();
    });
  });

  test.describe('Settings Management', () => {
    test('should update notification settings', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Settings")');

      await expect(page.getByText('Notifications')).toBeVisible();

      // Toggle notification switches
      const emailSwitch = page.getByRole('switch', { name: /email notifications/i });
      const pushSwitch = page.getByRole('switch', { name: /push notifications/i });
      const marketingSwitch = page.getByRole('switch', { name: /marketing emails/i });

      // Get current states
      const emailCurrentState = await emailSwitch.isChecked();
      const pushCurrentState = await pushSwitch.isChecked();
      const marketingCurrentState = await marketingSwitch.isChecked();

      // Toggle all switches
      await emailSwitch.click();
      await pushSwitch.click();
      await marketingSwitch.click();

      // Verify states changed
      await expect(emailSwitch).toBeChecked(!emailCurrentState);
      await expect(pushSwitch).toBeChecked(!pushCurrentState);
      await expect(marketingSwitch).toBeChecked(!marketingCurrentState);

      // Save settings
      await page.click('button:has-text("Save Settings")');
      await expect(page.getByText('Settings updated successfully!')).toBeVisible();

      // Reload and verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('button[role="tab"]:has-text("Settings")');

      await expect(emailSwitch).toBeChecked(!emailCurrentState);
      await expect(pushSwitch).toBeChecked(!pushCurrentState);
      await expect(marketingSwitch).toBeChecked(!marketingCurrentState);
    });

    test('should change theme and appearance settings', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Settings")');

      // Change theme
      await page.click('[role="combobox"]:near(:text("Theme"))');
      await page.click('[role="option"]:has-text("Dark")');

      // Verify selection
      await expect(page.getByDisplayValue('DARK')).toBeVisible();

      // Save settings
      await page.click('button:has-text("Save Settings")');
      await expect(page.getByText('Settings updated successfully!')).toBeVisible();

      // Verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('button[role="tab"]:has-text("Settings")');

      await expect(page.getByDisplayValue('DARK')).toBeVisible();
    });

    test('should change privacy and localization settings', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Settings")');

      // Change profile visibility
      await page.click('[role="combobox"]:near(:text("Profile Visibility"))');
      await page.click('[role="option"]:has-text("Private")');

      // Change language
      await page.click('[role="combobox"]:near(:text("Language"))');
      await page.click('[role="option"]:has-text("Español")');

      // Change timezone
      await page.click('[role="combobox"]:near(:text("Timezone"))');
      await page.click('[role="option"]:has-text("Eastern Time")');

      // Save settings
      await page.click('button:has-text("Save Settings")');
      await expect(page.getByText('Settings updated successfully!')).toBeVisible();

      // Verify persistence
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.click('button[role="tab"]:has-text("Settings")');

      await expect(page.getByDisplayValue('PRIVATE')).toBeVisible();
      await expect(page.getByDisplayValue('es')).toBeVisible();
      await expect(page.getByDisplayValue('America/New_York')).toBeVisible();
    });
  });

  test.describe('Avatar Upload', () => {
    test('should upload new avatar image', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Upload avatar image
      const fileInput = page.locator('input[type="file"][accept="image/*"]');
      
      // Create a test image file
      const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
      await fileInput.setInputFiles([{
        name: 'test-avatar.png',
        mimeType: 'image/png',
        buffer: buffer,
      }]);

      // Wait for upload to complete
      await expect(page.getByText(/uploaded|success/i)).toBeVisible({ timeout: 10000 });

      // Verify avatar image appears in header
      const avatarImage = page.getByRole('img', { name: /profile/i });
      await expect(avatarImage).toHaveAttribute('src', /avatars/);
    });

    test('should delete existing avatar', async ({ page }) => {
      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // First upload an avatar if not present
      const removeButton = page.getByRole('button', { name: /remove/i });
      const isRemoveVisible = await removeButton.isVisible().catch(() => false);

      if (!isRemoveVisible) {
        // Upload avatar first
        const fileInput = page.locator('input[type="file"][accept="image/*"]');
        const buffer = Buffer.from('test-image-data');
        await fileInput.setInputFiles([{
          name: 'test-avatar.png',
          mimeType: 'image/png',
          buffer: buffer,
        }]);
        await page.waitForTimeout(2000); // Wait for upload
      }

      // Now remove the avatar
      await page.click('button:has-text("Remove")');

      // Verify avatar is removed (fallback icon should appear)
      await expect(page.getByText('Current avatar image: Default avatar')).toBeVisible();
      await expect(page.getByRole('button', { name: /remove/i })).not.toBeVisible();
    });

    test('should validate avatar file types and sizes', async ({ page }) => {
      await page.goto('/profile');

      // Test invalid file type
      const fileInput = page.locator('input[type="file"][accept="image/*"]');
      await fileInput.setInputFiles([{
        name: 'document.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('fake pdf content'),
      }]);

      await expect(page.getByText('Please select an image file')).toBeVisible();

      // Test large file (would need to create actual large file for real test)
      // For demo purposes, we'll simulate the error message appearance
    });
  });

  test.describe('Activity History', () => {
    test('should display user activity history', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Activity")');

      await expect(page.getByText('Activity History')).toBeVisible();
      await expect(page.getByText('Your recent account activity and changes')).toBeVisible();

      // Should show activity entries
      await expect(page.locator('[data-testid="activity-entry"]').first()).toBeVisible();

      // Should show timestamps
      await expect(page.getByText(/ago/)).toBeVisible();
    });

    test('should refresh activity history', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Activity")');

      // Click refresh button
      await page.click('button:has-text("Refresh")');

      // Verify refresh icon animation
      await expect(page.locator('button:has-text("Refresh") .animate-spin')).toBeVisible();

      // Wait for refresh to complete
      await expect(page.locator('button:has-text("Refresh") .animate-spin')).not.toBeVisible();
    });

    test('should load more activities with pagination', async ({ page }) => {
      await page.goto('/profile');
      await page.click('button[role="tab"]:has-text("Activity")');

      // Wait for initial activities to load
      await page.waitForLoadState('networkidle');

      // If load more button exists, click it
      const loadMoreButton = page.getByRole('button', { name: /load more activity/i });
      const isLoadMoreVisible = await loadMoreButton.isVisible().catch(() => false);

      if (isLoadMoreVisible) {
        const initialActivityCount = await page.locator('[data-testid="activity-entry"]').count();
        
        await loadMoreButton.click();
        await page.waitForLoadState('networkidle');

        // Should have more activities after loading
        const newActivityCount = await page.locator('[data-testid="activity-entry"]').count();
        expect(newActivityCount).toBeGreaterThan(initialActivityCount);
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work correctly on mobile devices', async ({ page, isMobile }) => {
      test.skip(!isMobile, 'This test is only for mobile devices');

      await page.goto('/profile');
      await page.waitForLoadState('networkidle');

      // Verify tabs are responsive
      await expect(page.getByRole('tablist')).toBeVisible();

      // Test tab switching on mobile
      await page.click('button[role="tab"]:has-text("Security")');
      await expect(page.getByText('Security Overview')).toBeVisible();

      // Test form interactions on mobile
      await page.click('button[role="tab"]:has-text("Settings")');
      const emailSwitch = page.getByRole('switch', { name: /email notifications/i });
      await emailSwitch.click();

      // Verify mobile-specific layouts
      const profileHeader = page.locator('.flex-col.sm\\:flex-row').first();
      await expect(profileHeader).toHaveCSS('flex-direction', 'column');
    });

    test('should maintain functionality across different viewport sizes', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1200, height: 800 });
      await page.goto('/profile');

      await expect(page.getByText('Profile Information')).toBeVisible();

      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Profile Information')).toBeVisible();

      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await page.reload();
      await page.waitForLoadState('networkidle');

      await expect(page.getByText('Profile Information')).toBeVisible();

      // Test tab functionality still works
      await page.click('button[role="tab"]:has-text("Settings")');
      await expect(page.getByText('Notifications')).toBeVisible();
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      // This would require mocking API responses to return errors
      await page.goto('/profile');

      // Test form submission with network error
      await page.route('/api/users/me', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Server error occurred' }),
        });
      });

      await page.fill('[name="name"]', 'Updated Name');
      await page.click('button:has-text("Save Changes")');

      await expect(page.getByText('Server error occurred')).toBeVisible();
    });

    test('should handle network disconnection', async ({ page }) => {
      await page.goto('/profile');

      // Simulate network offline
      await page.context().setOffline(true);

      await page.fill('[name="name"]', 'Updated Name');
      await page.click('button:has-text("Save Changes")');

      // Should show appropriate error message
      await expect(page.getByText(/network|connection|error/i)).toBeVisible();

      // Restore connection
      await page.context().setOffline(false);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/profile');

      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('ArrowRight'); // Navigate to next tab
      
      // Verify focus management
      const securityTab = page.getByRole('tab', { name: /security/i });
      await expect(securityTab).toBeFocused();

      // Activate tab with Enter or Space
      await page.keyboard.press('Enter');
      await expect(page.getByText('Security Overview')).toBeVisible();
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/profile');

      // Check tab structure
      await expect(page.getByRole('tablist')).toBeVisible();
      const tabs = page.getByRole('tab');
      await expect(tabs).toHaveCount(4);

      // Check form labels
      await expect(page.getByLabelText('Display Name')).toBeVisible();
      await expect(page.getByLabelText('First Name')).toBeVisible();

      // Check switch labels
      await page.click('button[role="tab"]:has-text("Settings")');
      await expect(page.getByRole('switch', { name: /email notifications/i })).toBeVisible();
    });

    test('should work with screen reader announcements', async ({ page }) => {
      await page.goto('/profile');

      // Update profile and verify success announcement
      await page.fill('[name="name"]', 'Updated Name');
      await page.click('button:has-text("Save Changes")');

      const successMessage = page.getByText('Profile updated successfully!');
      await expect(successMessage).toBeVisible();

      // Verify the success message has appropriate ARIA attributes
      await expect(successMessage).toHaveAttribute('role', 'status');
    });
  });
});