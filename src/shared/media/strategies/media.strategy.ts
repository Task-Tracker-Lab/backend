export abstract class MediaDispatchStrategy {
    abstract readonly jobName: string;
    abstract createPayload(dto: any, userId: string, url: string): any;
}
