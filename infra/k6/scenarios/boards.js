import { SharedArray } from 'k6/data';
import { sleep, check } from 'k6';
import { GET_OPTIONS } from '../common/config.js';
import getAuthUser from '../shared/get-auth-user.js';

const users = new SharedArray('test users', function () {
    return JSON.parse(open('../data/users.json'));
});
const teams = new SharedArray('test teams', function () {
    return JSON.parse(open('../data/teams.json'));
});
const randomStr = (len = 8) =>
    Math.random()
        .toString(36)
        .substring(2, 2 + len);
const randomNum = (min = 1, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min;

const baseOptions = GET_OPTIONS();
baseOptions.thresholds = Object.assign({}, baseOptions.thresholds, {
    'http_req_duration{name:auth-sign-in}': ['p(95)<333'],
    'http_req_duration{name:post-teams-projects}': ['p(95)<333'],
    'http_req_duration{name:post-projects-boards}': ['p(95)<333'],
    'http_req_duration{name:get-projects-boards}': ['p(95)<333'],
    'http_req_duration{name:get-projects-boards-id}': ['p(95)<333'],
    'http_req_duration{name:patch-projects-boards}': ['p(95)<333'],
    'http_req_duration{name:delete-projects-boards}': ['p(95)<333'],
    'http_req_duration{name:delete-teams-projects}': ['p(95)<333'],
});

export const options = baseOptions;

export default function () {
    const user = users[(__VU - 1) % users.length];
    const team = teams[(__VU - 1) % teams.length];
    const { client } = getAuthUser(user);

    sleep(1);

    // --- create project ---
    const project = {
        name: `k6_board_project_${randomStr(6)}`,
        key: `K6${randomNum(1000, 9999)}`,
        description: 'k6 boards scenario project',
        visibility: 'public',
    };
    const createProjectRes = client.post(`/teams/${team.slug}/projects`, project, {
        tags: { name: 'post-teams-projects' },
    });
    const projectId = createProjectRes.json().projectId;

    check(createProjectRes, {
        'POST /teams/:slug/projects: has projectId': (r) => r.json().projectId !== undefined,
    });

    sleep(1);

    // --- create board ---
    const boardPayload = {
        name: `k6_board_${randomStr(6)}`,
        position: Date.now(),
    };
    const createBoardRes = client.post(`/projects/${projectId}/boards`, boardPayload, {
        tags: { name: 'post-projects-boards' },
    });
    const boardId = createBoardRes.json().id;

    check(createBoardRes, {
        'POST /projects/:id/boards: has id': (r) => r.json().id !== undefined,
    });

    sleep(1);

    // --- get all boards ---
    const listRes = client.get(
        `/projects/${projectId}/boards`,
        {},
        { tags: { name: 'get-projects-boards' } },
    );
    check(listRes, { 'GET /projects/:id/boards: array': (r) => Array.isArray(r.json()) });

    sleep(1);

    // --- get board ---
    client.get(
        `/projects/${projectId}/boards/${boardId}`,
        {},
        { tags: { name: 'get-projects-boards-id' } },
    );

    sleep(1);

    // --- update board ---
    const updatedBoard = {
        name: `k6_board_${randomStr(7)}`,
    };
    client.patch(`/projects/${projectId}/boards/${boardId}`, updatedBoard, {
        tags: { name: 'patch-projects-boards' },
    });

    sleep(1);

    // --- delete board ---
    client.delete(`/projects/${projectId}/boards/${boardId}`, {
        tags: { name: 'delete-projects-boards' },
    });

    sleep(1);

    // --- delete project ---
    client.delete(`/teams/${team.slug}/projects/${projectId}`, {
        tags: { name: 'delete-teams-projects' },
    });

    sleep(1);
}
