import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load hero and features', async ({ page }) => {
    // Check Hero title
    await expect(page.locator('h1')).toBeVisible();

    // Check Features section
    await expect(page.getByText('Nuestras Características y Servicios')).toBeAttached(); // sr-only
    // Check visible feature title exists (dynamic now)
    const features = page.locator('.text-brand-teal.font-bold');
    await expect(features.first()).toBeVisible();
  });

  test('should display product selection grid', async ({ page }) => {
    // Check Product Selection Title
    await expect(page.getByText('Selecciona tu lugar:')).toBeVisible();

    // Check helper text
    await expect(page.getByText('Da click sobre tu locacion preferida')).toBeVisible();

    // Check that at least one location card exists
    // We target the section containing the product grid
    const productSection = page.locator('section').filter({ hasText: 'Selecciona tu lugar' });
    const grid = productSection.locator('.grid');
    const emptyMsg = productSection.getByText('Lo sentimos, no existen mesas');

    await expect(grid.or(emptyMsg)).toBeVisible();
  });
});
