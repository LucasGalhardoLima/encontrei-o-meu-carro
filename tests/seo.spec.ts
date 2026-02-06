import { test, expect } from '@playwright/test';

test.describe('Programmatic SEO', () => {
    test('should render car detail page with correct metadata', async ({ page }) => {
        await page.goto('/results');

        const firstCarLink = page.locator('a[href^="/carros/"]').first();
        await expect(firstCarLink).toBeVisible();
        const href = await firstCarLink.getAttribute('href');
        expect(href).toMatch(/^\/carros\/.+/);

        const response = await page.goto(href!);

        expect(response?.status()).toBe(200);
        await expect(page.locator('h1')).toBeVisible();
        await expect(page).toHaveTitle(/Detalhes e Ficha Técnica/i);
        const description = page.locator('meta[name="description"]');
        await expect(description).toHaveAttribute('content', /Confira os detalhes do/i);
    });

    test('should handle invalid car slugs gracefully', async ({ page }) => {
        const response = await page.goto('/carros/invalid-id');
        expect(response?.status()).toBe(404);
    });
});
