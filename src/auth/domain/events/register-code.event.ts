export class RegisterCodeEvent {
    constructor(
        public readonly email: string,
        public readonly name: string,
        public readonly otp: string,
    ) {}
}
