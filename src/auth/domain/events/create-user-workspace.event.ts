export class CreateUserWorkspaceEvent {
    constructor(
        public userId: string,
        public username: string,
    ) {}
}
