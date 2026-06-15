import * as os from 'node:os';

import { Inject, Injectable } from '@nestjs/common';

import { MODULE_OPTIONS_TOKEN } from './health.module-definition';

import type { HealthModuleOptions } from './interfaces';

@Injectable()
export class HealthService {
    private readonly startTime: Date;

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: HealthModuleOptions,
    ) {
        this.startTime = new Date();
    }

    async getHealthData() {
        const { serviceName, version = 'v1.0.0', indicators = {} } = this.options;

        const uptimeSeconds = Math.floor(process.uptime());

        const results = await Promise.all(
            Object.entries(indicators).map(async ([name, check]) => {
                if (!check || typeof check !== 'function') {
                    return { name, ok: false, error: 'Health check not configured' };
                }

                let timeoutId: NodeJS.Timeout | undefined;

                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => reject(new Error('Timeout')), 5000);
                });

                try {
                    const result = await Promise.race([check(), timeoutPromise]);
                    return { name, ok: !!result };
                } catch (e) {
                    const message = e instanceof Error ? e.message : String(e);
                    return { name, ok: false, error: message };
                } finally {
                    clearTimeout(timeoutId);
                }
            }),
        );

        const isAllOk = results.every((r) => r.ok);
        const components = Object.fromEntries(results.map((r) => [r.name, r.ok ? 'up' : 'down']));

        const loaded = os.loadavg()[0];

        return {
            service: serviceName,
            status: isAllOk,
            components,
            info: {
                version,
                node: process.version,
            },
            time: {
                now: new Date().toISOString(),
                startedAt: this.startTime.toISOString(),
                uptime: this.formatUptime(uptimeSeconds),
                uptimeSeconds,
            },
            loaded: loaded?.toFixed(2),
        };
    }

    private formatUptime(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    }
}
