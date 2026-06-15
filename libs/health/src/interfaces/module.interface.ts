export type HealthIndicatorsServices = 'redis' | 'database' | 'storage' | 'http';
export type HealthIndicatorKey = HealthIndicatorsServices | (string & NonNullable<unknown>);
export type HealthIndicatorFn = () => boolean | Promise<boolean>;

export interface HealthModuleOptions {
    readonly serviceName: string;
    readonly version?: string;
    readonly indicators?: Partial<Record<HealthIndicatorKey, HealthIndicatorFn>>;
}
