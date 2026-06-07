import { IdentitiesRepository } from './identities.repository';
import { SessionRepository } from './session.repository';

export const REPOSITORIES = [
    { provide: 'ISessionRepository', useClass: SessionRepository },
    { provide: 'IIdentitiesRepository', useClass: IdentitiesRepository },
];
