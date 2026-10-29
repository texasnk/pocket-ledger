import { expect, test } from '@playwright/test';
test('opens the dashboard interface', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Visão geral' })).toBeVisible();
});
