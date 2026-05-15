import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('os', async () => {
    const actual = await vi.importActual<typeof import('os')>('os');
    return {
        ...actual,
        loadavg: () => [1.23, 0.5, 0.1],
    };
});
import { HealthService } from './health.service';
import type { HealthModuleOptions } from './interfaces';

describe('HealthService', () => {
    const BASE_TIME = new Date('2026-05-15T10:00:00.000Z');

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(BASE_TIME);
        vi.spyOn(process, 'uptime').mockReturnValue(3661);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('returns healthy payload when all indicators are ok', async () => {
        const options: HealthModuleOptions = {
            serviceName: 'MyService',
            version: 'v2.0.0',
            indicators: {
                database: () => true,
                redis: async () => true,
            },
        };

        const service = new HealthService(options);
        const data = await service.getHealthData();

        expect(data).toMatchObject({
            service: 'MyService',
            status: true,
            components: { database: 'up', redis: 'up' },
            info: { version: 'v2.0.0', node: process.version },
            time: {
                now: BASE_TIME.toISOString(),
                startedAt: BASE_TIME.toISOString(),
                uptime: '1h 1m 1s',
                uptimeSeconds: 3661,
            },
            loaded: '1.23',
        });
    });

    it('marks status as false when any indicator fails or throws', async () => {
        const options: HealthModuleOptions = {
            serviceName: 'MyService',
            indicators: {
                cache: () => true,
                database: () => false,
                storage: () => {
                    throw new Error('boom');
                },
            },
        };

        const service = new HealthService(options);
        const data = await service.getHealthData();

        expect(data.status).toBe(false);
        expect(data.components).toEqual({ database: 'down', storage: 'down', cache: 'up' });
    });

    it('marks indicator as down on timeout', async () => {
        const options: HealthModuleOptions = {
            serviceName: 'MyService',
            indicators: {
                http: () => new Promise<boolean>(() => undefined),
            },
        };

        const service = new HealthService(options);
        const resultPromise = service.getHealthData();

        await vi.advanceTimersByTimeAsync(5000);

        const data = await resultPromise;

        expect(data.status).toBe(false);
        expect(data.components).toEqual({ http: 'down' });
    });
});
