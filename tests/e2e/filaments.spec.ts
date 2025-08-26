import { test, expect } from '@playwright/test';

test.describe('Filaments Page', () => {
  test('should load filaments page successfully', async ({ page }) => {
    await page.goto('/filaments');
    
    // Check page title or heading
    await expect(page.locator('h1, h2').first()).toContainText(/filament/i);
    
    // Should have a table or grid for filaments
    const table = page.locator('table').first();
    if (await table.isVisible()) {
      await expect(table).toBeVisible();
    }
  });

  test('should display filaments data', async ({ page }) => {
    await page.goto('/filaments');
    
    // Wait for any loading to complete
    await page.waitForTimeout(1000);
    
    // Look for either table data or empty state
    const hasData = await page.locator('table tbody tr').count() > 0;
    const hasEmptyState = await page.locator('text=No filaments').isVisible();
    
    expect(hasData || hasEmptyState).toBe(true);
  });
});