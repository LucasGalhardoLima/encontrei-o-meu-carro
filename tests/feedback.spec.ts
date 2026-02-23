import { test, expect } from '@playwright/test';

const dbTest = process.env.RUN_DB_TESTS === '1' ? test : test.skip;

test.describe('Feedback API', () => {
    dbTest('should save user feedback via API', async ({ request }) => {
        const { prisma } = await import('~/utils/db.server');

        // 1. Setup: Get a valid car ID
        const car = await prisma.car.findFirst();
        expect(car).not.toBeNull();
        const carId = car!.id;

        // 2. Request
        const payload = {
            carId: carId,
            thumbs: true,
            weights: { comfort: 10, economy: 5 }
        };

        const response = await request.post('/api/feedback', {
            data: payload
        });

        // 3. Verify Response
        expect(response.status()).toBe(200);
        const json = await response.json();
        expect(json.success).toBe(true);

        // 4. Verify DB
        const feedback = await prisma.feedback.findFirst({
            where: { carId: carId },
            orderBy: { createdAt: 'desc' }
        });
        expect(feedback).not.toBeNull();
        expect(feedback?.thumbs).toBe(true);
        expect(feedback?.weights).toEqual(payload.weights);
    });
});
