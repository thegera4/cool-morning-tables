import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

test('authenticate', async ({ page }) => {
  // Increase timeout to 5 minutes for manual interaction
  test.setTimeout(300000);

  // Ensure the directory exists
  const dir = path.dirname(authFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // 1. Navigate to the site
  await page.goto('/');

  // 2. Click the Sign In button to start the Clerk flow
  // You might need to adjust this selector if you have multiple buttons
  await page.getByRole('button', { name: /Inicia sesión/i }).first().click();

  console.log('Waiting for user to log in...');

  // 3. Wait for the user to complete login manually
  // We know login is successful when "Mis Reservas" link appears in the header
  // giving a long timeout (2 minutes) for the user to type credentials/OTP
  // Using .first() because there might be multiple links (header, footer, mobile menu)
  await expect(page.getByRole('link', { name: 'Mis Reservas' }).first()).toBeVisible({ timeout: 120000 });

  // 4. Save the storage state (cookies, local storage) to the file
  await page.context().storageState({ path: authFile });

  console.log(`Authentication state saved to ${authFile}`);
});
