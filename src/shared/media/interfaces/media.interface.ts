export type MediaEntityType = 'team' | 'user';

export interface UpdateMediaUser {
    entity: {
        type: 'user';
        id: string;
    };
    url: string;
}

export interface UpdateMediaTeam {
    entity: {
        type: 'team';
        slug: string;
    };
    url: string;
    type: 'avatar' | 'banner';
    initiatorId: string;
}
