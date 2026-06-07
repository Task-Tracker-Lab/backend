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
    'http_req_duration{name:teams-members-list}': ['p(95)<333'],
    'http_req_duration{name:teams-members-update}': ['p(95)<333'],
});

export const options = baseOptions;

function pickTargetMember(items = []) {
    if (!items.length) return null;
    const notOwner = items.find((m) => m.role && m.role !== 'owner');
    return notOwner || (items.length > 1 ? items[1] : items[0]);
}

export default function () {
    const idx = (__VU - 1) % teams.length;
    const team = teams[idx];
    const user = users[idx % users.length];
    const { client } = getAuthUser(user);

    sleep(1);

    // --- GET /teams/:id/members ---
    const membersRes = client.get(
        `/teams/${team.id}/members`,
        {},
        {
            tags: { name: 'teams-members-list' },
        },
    );

    const members = membersRes.json().items || [];
    const target = pickTargetMember(members);

    sleep(1);

    // --- PATCH /teams/:slug/members/:userId ---
    if (target && target.id) {
        client.patch(
            `/teams/${team.id}/members/${target.id}`,
            { role: 'member' },
            { tags: { name: 'teams-members-update' } },
        );
    }

    sleep(1);
}
