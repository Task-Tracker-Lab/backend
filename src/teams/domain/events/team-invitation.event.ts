export class TeamInvitationEvent {
    constructor(
        public readonly email: string,
        public readonly teamName: string,
        public readonly inviteUrl: string,
    ) {}
}
