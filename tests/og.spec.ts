import { test, expect } from '@playwright/test';

test.describe('Dynamic OG Images', () => {
    test('should generate an OG image for a car', async ({ request }) => {
        // Using query params for now to simulate data passed to the generator
        // Route: /resource/og?brand=Fiat&model=Fastback&year=2024&badge=Top%20Conforto
        const response = await request.get('/resource/og', {
            params: {
                brand: 'Fiat',
                model: 'Fastback',
                year: '2024',
                badge: 'Top Conforto',
                price: '135990'
            }
        });

        expect(response.status()).toBe(200);
        expect(response.headers()['content-type']).toBe('image/png');
    });

    // Test with missing params (should probably still generate something or return 400)
    test('should handle missing params', async ({ request }) => {
        const response = await request.get('/resource/og');
        expect(response.status()).toBe(200); // Or 400 depending on implementation. Let's aim for graceful fallback.
        expect(response.headers()['content-type']).toBe('image/png');
    });
});
