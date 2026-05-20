import { SharedArray } from 'k6/data';
import { sleep } from 'k6';
import { GET_OPTIONS } from '../common/config.js';
import getAuthUser from '../shared/get-auth-user.js';

const users = new SharedArray('test users', function () {
    return JSON.parse(open('../data/users.json'));
});
const teams = new SharedArray('test teams', function () {
    return JSON.parse(open('../data/teams.json'));
});

const baseOptions = GET_OPTIONS();
baseOptions.thresholds = Object.assign({}, baseOptions.thresholds, {
    'http_req_duration{name:auth-sign-in}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-list}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-get}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-update}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-create}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-create-duplicate}': ['p(95)<333'],
    'http_req_duration{name:teams-invitations-accept}': ['p(95)<333'],
});

export const options = baseOptions;

function buildUserIndex(list) {
    const index = {};
    for (const u of list) index[u.email] = u;
    return index;
}

const userByEmail = buildUserIndex(users);

export default function () {
    const idx = (__VU - 1) % teams.length;
    const team = teams[idx];
    const owner = users[idx % users.length];
    const { client } = getAuthUser(owner);

    sleep(1);

    // --- GET /teams/:slug/invitations ---
    const listRes = client.get(
        `/teams/${team.slug}/invitations`,
        {},
        {
            tags: { name: 'teams-invitations-list' },
        },
    );

    sleep(1);

    const listBody =
        listRes && listRes.status >= 200 && listRes.status < 300 ? listRes.json() : null;
    const items = listBody && Array.isArray(listBody.items) ? listBody.items : [];
    const invite = items.length ? items[0] : null;

    if (invite && invite.code) {
        // --- GET /teams/:slug/invitations/:code ---
        client.get(
            `/teams/${team.slug}/invitations/${invite.code}`,
            {},
            {
                tags: { name: 'teams-invitations-get' },
            },
        );

        sleep(1);

        // --- PATCH /teams/:slug/invitations/:code ---
        client.patch(
            `/teams/${team.slug}/invitations/${invite.code}`,
            { role: 'member' },
            { tags: { name: 'teams-invitations-update' } },
        );

        sleep(1);

        // --- POST /teams/:slug/invitations/:code/accept ---
        if (__ITER === 0 && invite.email && userByEmail[invite.email]) {
            const invitedUser = userByEmail[invite.email];
            const { client: invitedClient } = getAuthUser(invitedUser, {
                tags: { name: 'auth-sign-in' },
            });

            invitedClient.post(
                `/teams/${team.slug}/invitations/${invite.code}/accept`,
                {},
                { tags: { name: 'teams-invitations-accept' } },
            );
        }
    }

    sleep(1);

    // --- POST /teams/:slug/invitations ---
    const randomEmail = `k6_invite_${__VU}_${__ITER}@tasktracker.local`;
    client.post(
        `/teams/${team.slug}/invitations`,
        { email: randomEmail, role: 'member' },
        {
            tags: { name: 'teams-invitations-create' },
        },
    );

    sleep(1);

    // --- POST /teams/:slug/invitations (duplicate) ---
    client.post(
        `/teams/${team.slug}/invitations`,
        { email: randomEmail, role: 'member' },
        {
            tags: { name: 'teams-invitations-create-duplicate' },
            expectedStatuses: [400],
        },
    );

    sleep(1);
}
