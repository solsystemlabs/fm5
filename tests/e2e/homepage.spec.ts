import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/FM5 Manager/);
    
    // Check for main navigation elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Filaments')).toBeVisible();
    await expect(page.locator('text=Models')).toBeVisible();
  });

  test('should navigate to filaments page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Filaments');
    await expect(page).toHaveURL(/\/filaments/);
  });

  test('should navigate to models page', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Models');
    await expect(page).toHaveURL(/\/models/);
  });
});