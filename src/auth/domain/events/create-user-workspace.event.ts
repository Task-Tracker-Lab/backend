export class CreateUserWorkspaceEvent {
    constructor(
        public readonly userId: string,
        public readonly username: string,
    ) {}
}
