import { test, expect } from '@playwright/test';

test.describe('FIPE Import Flow', () => {
    test.use({
        extraHTTPHeaders: {
            'Authorization': 'Basic ' + Buffer.from('admin:123456').toString('base64')
        }
    });

    test('should allow importing cars from FIPE as drafts', async ({ page }) => {
        // 1. Navigate to Admin
        await page.goto('/admin');
        await expect(page).toHaveTitle(/Admin/);

        // 2. Switch to Import Tab
        await page.getByRole('tab', { name: 'Importar da FIPE' }).click();
        
        // 3. Select a Brand (Assuming data loads from real API, we wait for links)
        // We pick a common one like "Acura" or first one to be safe, or search specific.
        // Let's grab the first brand link in the grid.
        const brandLink = page.locator('a[href*="importBrand="]').first();
        await expect(brandLink).toBeVisible({ timeout: 10000 });
        await brandLink.click();

        // 4. Wait for Models to Load
        await expect(page.getByText('Selecione os Modelos')).toBeVisible();
        
        // 5. Select first model
        const firstModelCheckbox = page.locator('input[name="selectedModels"]').first();
        // Click the label to check the box (Radix UI checkbox input is hidden)
        await page.locator('label[for^="model-"]').first().click();

        // 6. Import
        await page.getByRole('button', { name: 'Importar Selecionados como Rascunho' }).click();

        // 7. Verify Success Message
        await expect(page.getByText(/importados como Rascunho/)).toBeVisible();

        // 8. Verify it appears in the Sidebar as Draft (Rascunho)
        // Switch back to manual tab to see list? Or list is visible? 
        // The list is visible in Manual tab. The action redirects/reloads.
        await page.getByRole('tab', { name: 'Editor Manual' }).click();
        await expect(page.getByText('Rascunho').first()).toBeVisible();
    });
});
