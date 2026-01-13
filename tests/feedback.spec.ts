import { test, expect } from '@playwright/test';
import { prisma } from '~/utils/db.server';

test.describe('Feedback API', () => {
    test('should save user feedback via API', async ({ request }) => {
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
        expect(JSON.parse(feedback?.weights || '{}')).toEqual(payload.weights);
    });
});
