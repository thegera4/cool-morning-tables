import { test, expect } from '@playwright/test';

test.describe('Booking Flow', () => {
  test('navigates from home to product booking page', async ({ page }) => {
    // 1. Go to home page
    await page.goto('/');

    // 2. Click on the first product card
    // Wait for the grid to appear - increased timeout for dynamic sanity data
    // Use the same strategy as home.spec.ts to verify the product section exists
    const productSection = page.locator('section').filter({ hasText: 'Selecciona tu lugar' });
    await expect(productSection).toBeVisible({ timeout: 15000 });

    const productGrid = productSection.locator('.grid');

    // Check if grid has items or if we are in empty state
    // If empty state, we can't really test booking flow, so we should fail or skip
    // But failing is better to alert us.

    // Try to find ANY element inside the grid that looks like a card content
    // We look for CardContent which usually has "p-4" class or similar, or just any div.
    // Let's rely on finding a PRICE which is usually rendered, e.g. "$", or the title.

    // We will wait for the first h4 in the grid
    const cardTitle = productGrid.locator('h4').first();
    await expect(cardTitle).toBeVisible({ timeout: 10000 });

    // Click the card (parent of title) or just the title itself
    await cardTitle.click({ force: true });

    // 3. Verify we are on the booking page component view
    // Check for "¡Casi listo!" title which appears for unauthenticated users
    await expect(page.getByText('¡Casi listo!', { exact: false })).toBeVisible({ timeout: 10000 });

    // 4. Verify Sign In button is present
    // There might be multiple buttons (header + CTA), so we target the big CTA specifically 
    // or simply check that at least one is visible.
    // Let's target the one in the main content area to be specific.
    const ctaButton = page.locator('main button', { hasText: /Inicia sesión para reservar/i });
    await expect(ctaButton).toBeVisible();

    // 5. Verify Extras are NOT visible yet (because unauthenticated)
    await expect(page.getByTestId('booking-calendar')).not.toBeVisible();
  });
});
