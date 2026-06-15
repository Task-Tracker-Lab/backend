import { IdentitiyRepository } from './identity.repository';
import { SessionRepository } from './session.repository';

export const REPOSITORIES = [
    { provide: 'ISessionRepository', useClass: SessionRepository },
    { provide: 'IIdentityRepository', useClass: IdentitiyRepository },
];
