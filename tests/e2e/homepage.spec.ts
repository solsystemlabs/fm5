import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads without critical errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have basic navigation', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any navigation elements that might exist
    // Using more flexible selectors since we don't know the exact structure
    const navLinks = await page.locator('a[href*="/"]').count();
    expect(navLinks).toBeGreaterThan(0);
  });
});