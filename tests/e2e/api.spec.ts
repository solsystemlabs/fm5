import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  test('health endpoint should return OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.status).toBe('ok');
  });

  test('filaments API should be accessible', async ({ request }) => {
    const response = await request.get('/api/filaments');
    expect(response.status()).toBeLessThan(500);
  });

  test('brands API should be accessible', async ({ request }) => {
    const response = await request.get('/api/brands');
    expect(response.status()).toBeLessThan(500);
  });

  test('material-types API should be accessible', async ({ request }) => {
    const response = await request.get('/api/material-types');
    expect(response.status()).toBeLessThan(500);
  });
});