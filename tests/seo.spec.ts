import { test, expect } from '@playwright/test';

test.describe('Programmatic SEO', () => {
    test('should render car detail page with correct metadata', async ({ page }) => {
        // Assuming the car exists (Fiat Fastback 2024 from seed)
        // URL Structure: /carros/:brand/:slug (where slug = model-year)
        const response = await page.goto('/carros/Fiat/Fastback-2024');

        // 1. Check Response
        expect(response?.status()).toBe(200);

        // 2. Check Title
        await expect(page).toHaveTitle(/Fiat Fastback 2024.*Encontre o Meu Carro/i);

        // 3. Check Mega Tags
        const description = page.locator('meta[name="description"]');
        await expect(description).toHaveAttribute('content', /Fiat Fastback/i);
        
        // 4. Check H1
        await expect(page.locator('h1')).toContainText('Fiat Fastback');
    });

    test('should handle invalid car slugs gracefully', async ({ page }) => {
        const response = await page.goto('/carros/Fiat/Nave-Espacial-3000');
        expect(response?.status()).toBe(404);
    });
});
