export type MediaEntityType = 'team' | 'user';

export interface UpdateMediaUser {
    entity: {
        type: 'user';
        id: string;
    };
    path: string;
}

export interface UpdateMediaTeam {
    entity: {
        type: 'team';
        slug: string;
    };
    path: string;
    type: 'avatar' | 'banner';
    initiatorId: string;
}
