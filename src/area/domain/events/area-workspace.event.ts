export class AreaCreateEvent {
    constructor(
        readonly userId: string,
        readonly projectSlug: string,
    ) {}
}
