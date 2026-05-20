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
const tags = new SharedArray('test tags', function () {
    return JSON.parse(open('../data/tags.json'));
});

const baseOptions = GET_OPTIONS();
baseOptions.thresholds = Object.assign({}, baseOptions.thresholds, {
    'http_req_duration{name:auth-sign-in}': ['p(95)<333'],
    'http_req_duration{name:teams-tags-sync}': ['p(95)<333'],
});

export const options = baseOptions;

function pickTags(count = 3) {
    if (!tags.length) return ['k6_tag'];
    const start = (__VU - 1) % tags.length;
    const selected = [];
    for (let i = 0; i < Math.min(count, tags.length); i++) {
        const idx = (start + i) % tags.length;
        selected.push(tags[idx].name);
    }
    return selected;
}

export default function () {
    const idx = (__VU - 1) % teams.length;
    const team = teams[idx];
    const user = users[idx % users.length];
    const { client } = getAuthUser(user);

    sleep(1);

    // --- PUT /teams/:slug/tags ---
    client.put(
        `/teams/${team.slug}/tags`,
        { tags: pickTags(3) },
        { tags: { name: 'teams-tags-sync' } },
    );

    sleep(1);
}
