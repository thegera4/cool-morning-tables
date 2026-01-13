import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Reservations Page', () => {

  test.describe('Unauthenticated', () => {
    test('should redirect to login when accessing directly', async ({ page }) => {
      await page.goto('/reservas');
      // Clerk redirects to sign-in
      await expect(page).toHaveURL(/sign-in/);
    });
  });

  test.describe('Authenticated', () => {
    // This test requires a valid auth state. 
    // If you have a populated 'playwright/.auth/user.json', you can use it.
    // Otherwise, this test will fail if we don't mock/skip it.
    // We will skip it if the auth file doesn't exist to prevent CI failure.

    // Check if auth state exists (mock check for demo)
    const authFile = 'playwright/.auth/user.json';
    const authFileExists = fs.existsSync(authFile);

    // Load state if it exists
    if (authFileExists) {
      test.use({ storageState: authFile });
    }

    test('should load reservations for logged in user', async ({ page }) => {
      test.skip(!authFileExists, 'Authentication state not found. Create playwright/.auth/user.json to run this test.');

      // If we had the file, we would load it:
      // test.use({ storageState: authFile });

      await page.goto('/reservas');

      // Verify we are NOT redirected
      await expect(page).toHaveURL('/reservas');

      // Verify Title
      await expect(page.getByRole('heading', { name: 'Mis Reservas' })).toBeVisible();

      // Verify the list exists (even if empty)
      // The ReservationList component renders a specific container
      await expect(page.locator('main')).toBeVisible();
    });
  });
});
