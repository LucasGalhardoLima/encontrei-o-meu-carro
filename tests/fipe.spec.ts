import { test, expect } from '@playwright/test';

test.describe('Admin Backoffice', () => {
    test.use({
        extraHTTPHeaders: {
            'Authorization': 'Basic ' + Buffer.from('admin:123456').toString('base64')
        }
    });

    test('should render admin list for authorized user', async ({ page }) => {
        await page.goto('/admin');
        await expect(page).toHaveTitle(/Admin/);
        await expect(page.getByRole('heading', { name: 'Admin Panel' })).toBeVisible();
        await expect(page.getByRole('link', { name: /Novo Carro/i })).toBeVisible();
        await expect(page.getByPlaceholder('Buscar por marca ou modelo...')).toBeVisible();
    });
});
