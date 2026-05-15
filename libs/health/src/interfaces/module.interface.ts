export type HealthIndicatorsServices = 'redis' | 'database' | 'storage' | 'http';
export type HealthIndicatorKey = HealthIndicatorsServices | (string & NonNullable<unknown>);
export type HealthIndicatorFn = () => boolean | Promise<boolean>;

export interface HealthModuleOptions {
    serviceName: string;
    version?: string;
    indicators?: Partial<Record<HealthIndicatorKey, HealthIndicatorFn>>;
}
