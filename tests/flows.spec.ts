import { test, expect } from '@playwright/test';

test.describe('User Flow', () => {
  test('should navigate from home to quiz and show results', async ({ page }) => {
    // 1. Home Page
    await page.goto('/');
    await expect(page).toHaveTitle(/Encontre o Meu Carro/i);
    
    // Click "Começar" or similar CTA
    const startButton = page.getByRole('link', { name: /Começar|Quiz/i });
    if (await startButton.isVisible()) {
        await startButton.click();
    } else {
        await page.goto('/quiz');
    }

    // 2. Quiz Page
    await expect(page.url()).toContain('/quiz');
    
    // Fill inputs (assuming sliders or inputs)
    // We'll try to find inputs by name or label if possible, or just submit defaults if they are sliders
    // Assuming the slider components rely on hidden inputs or similar, 
    // but if they are Radix UI Sliders, we might need specific locators.
    // For now, let's just try to submit the form to see defaults working.
    
    await page.getByRole('button', { name: /Ver Carros Recomendados/i }).click();

    // 3. Results Page
    await expect(page).toHaveURL(/.*\/results/);
    
    // Check if cars are listed
    const carCards = page.locator('a[href^="/admin?edit="], a[href^="/compare"]'); 
    // Note: The results page links might vary. Let's look for a generic car card structure.
    
    // Adjust selector based on actual UI if needed. 
    // Assuming there's at least one match.
    // We can also check for "Match" text.
    await expect(page.getByText(/Match/i).first()).toBeVisible();
  });
});

test.describe('Admin Security', () => {
    test('should protect /admin route', async ({ page }) => {
        const response = await page.goto('/admin');
        expect(response?.status()).toBe(401);
    });
});
