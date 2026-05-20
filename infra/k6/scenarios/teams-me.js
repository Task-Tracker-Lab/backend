import { SharedArray } from 'k6/data';
import { sleep } from 'k6';
import { GET_OPTIONS } from '../common/config.js';
import getAuthUser from '../shared/get-auth-user.js';

const users = new SharedArray('test users', function () {
    return JSON.parse(open('../data/users.json'));
});

const baseOptions = GET_OPTIONS();
baseOptions.thresholds = Object.assign({}, baseOptions.thresholds, {
    'http_req_duration{name:auth-sign-in}': ['p(95)<333'],
    'http_req_duration{name:users-me-teams}': ['p(95)<333'],
    'http_req_duration{name:users-me-invites}': ['p(95)<333'],
});

export const options = baseOptions;

export default function () {
    const user = users[(__VU - 1) % users.length];
    const { client } = getAuthUser(user);

    sleep(1);

    // --- GET /users/me/teams ---
    client.get('/users/me/teams', {}, { tags: { name: 'users-me-teams' } });

    sleep(1);

    // --- GET /users/me/invites ---
    client.get('/users/me/invites', {}, { tags: { name: 'users-me-invites' } });

    sleep(1);
}
