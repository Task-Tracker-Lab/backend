import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from './health.controller';
import { HttpStatus, Logger } from '@nestjs/common';

describe('HealthController', () => {
    let controller: HealthController;
    let healthServiceMock: { readonly getHealthData: ReturnType<typeof vi.fn> };

    const SERVICE_NAME = 'MyService';

    beforeEach(() => {
        healthServiceMock = {
            getHealthData: vi.fn(),
        };

        controller = new HealthController(healthServiceMock as any);

        vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    it('should throw SERVICE_UNAVAILABLE when service status is false (down)', async () => {
        healthServiceMock.getHealthData.mockResolvedValue({
            service: SERVICE_NAME,
            status: false,
            components: { database: 'down' },
        });

        await expect(controller.checkHealth()).rejects.toMatchObject({
            status: HttpStatus.SERVICE_UNAVAILABLE,
            response: {
                code: 'SERVICE_UNHEALTHY',
                message: expect.stringContaining(SERVICE_NAME),
                details: expect.arrayContaining([
                    expect.objectContaining({
                        target: SERVICE_NAME,
                        status: false,
                    }),
                ]),
            },
        });
    });

    it('should return "healthy" when status is true', async () => {
        healthServiceMock.getHealthData.mockResolvedValue({ service: SERVICE_NAME, status: true });

        const result = await controller.checkHealth();

        expect(result.status).toBe('healthy');
    });

    describe('ping', () => {
        it('should return the full health payload', async () => {
            const mockPayload = {
                service: SERVICE_NAME,
                status: true,
                components: {},
                time: { uptime: '1h 0m 0s' },
            };
            healthServiceMock.getHealthData.mockResolvedValue(mockPayload);

            const result = await controller.ping();

            expect(result).toEqual(mockPayload);
            expect(healthServiceMock.getHealthData).toHaveBeenCalledTimes(1);
        });
    });
});
