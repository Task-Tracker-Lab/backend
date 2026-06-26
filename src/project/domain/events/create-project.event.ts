export class ProjectCreateEvent {
    constructor(
        readonly userId: string,
        readonly teamId: string,
    ) {}
}
