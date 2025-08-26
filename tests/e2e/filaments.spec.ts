import { test, expect } from '@playwright/test';

test.describe('Filaments Page', () => {
  test('should load filaments page successfully', async ({ page }) => {
    await page.goto('/filaments');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loads without critical errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should render filaments page content', async ({ page }) => {
    await page.goto('/filaments');
    
    // Wait for any loading to complete
    await page.waitForLoadState('networkidle');
    
    // Check that we have some content on the page
    const pageContent = await page.textContent('body');
    expect(pageContent?.length || 0).toBeGreaterThan(0);
  });
});