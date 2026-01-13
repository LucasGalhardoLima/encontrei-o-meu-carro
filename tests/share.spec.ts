import { test, expect } from '@playwright/test';

test.describe('Viral Sharing', () => {
    test('should restore state from shared results link', async ({ page }) => {
        // Shared link with 50 Comfort / 50 Economy
        const url = '/results?w_comfort=50&w_economy=50&w_performance=0&w_space=0&mode=match';
        await page.goto(url);

        // 1. Verify URL is preserved (or at least params are present)
        await expect(page).toHaveURL(/w_comfort=50/);

        // 2. Verify results are loaded
        // This implicitly checks that the backend accepted the params and returned matches
        await expect(page.locator('text=Match').first()).toBeVisible();

        // 3. Verify Visual Feedback (Optional, assuming we show the weights somewhere)
        // For now, just ensuring page loades without error is a good start.
    });

    test('should show share button', async ({ page }) => {
        const url = '/results?w_comfort=25&w_economy=25&w_performance=25&w_space=25&mode=match';
        await page.goto(url);
        
        // Check for Share CTA
        await expect(page.getByRole('button', { name: /Compartilhar/i })).toBeVisible();
    });
});
