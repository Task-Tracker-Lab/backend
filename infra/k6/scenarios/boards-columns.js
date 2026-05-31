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
    'http_req_duration{name:get-boards-columns}': ['p(95)<333'],
    'http_req_duration{name:post-boards-columns}': ['p(95)<333'],
    'http_req_duration{name:get-boards-columns-id}': ['p(95)<333'],
    'http_req_duration{name:patch-boards-columns}': ['p(95)<333'],
    'http_req_duration{name:delete-boards-columns}': ['p(95)<333'],
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
        name: `k6_columns_project_${randomStr(6)}`,
        key: `K6${randomNum(1000, 9999)}`,
        description: 'k6 columns scenario project',
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
        name: `k6_columns_board_${randomStr(6)}`,
        position: Date.now(),
    };
    const createBoardRes = client.post(`/projects/${projectId}/boards`, boardPayload, {
        tags: { name: 'post-projects-boards' },
    });
    const boardId = createBoardRes.json().boardId;

    check(createBoardRes, {
        'POST /projects/:id/boards: has board id': (r) => r.json().boardId !== undefined,
    });

    sleep(1);

    // --- get all columns ---
    const listRes = client.get(
        `/boards/${boardId}/columns`,
        {},
        { tags: { name: 'get-boards-columns' } },
    );

    sleep(1);

    // --- create column ---
    const columnPayload = {
        name: `k6_column_${randomStr(6)}`,
        position: 4000,
        color: '#22c55e',
    };
    const createColumnRes = client.post(`/boards/${boardId}/columns`, columnPayload, {
        tags: { name: 'post-boards-columns' },
    });
    const columnId = createColumnRes.json().columnId;

    check(createColumnRes, {
        'POST /boards/:id/columns: has column id': (r) => r.json().columnId !== undefined,
    });

    sleep(1);

    // --- get column ---
    client.get(
        `/boards/${boardId}/columns/${columnId}`,
        {},
        { tags: { name: 'get-boards-columns-id' } },
    );

    sleep(1);

    // --- update column ---
    const updatedColumn = {
        name: `k6_column_${randomStr(7)}`,
        color: '#3b82f6',
    };
    client.patch(`/boards/${boardId}/columns/${columnId}`, updatedColumn, {
        tags: { name: 'patch-boards-columns' },
    });

    sleep(1);

    // --- delete column ---
    client.delete(`/boards/${boardId}/columns/${columnId}`, {
        tags: { name: 'delete-boards-columns' },
    });

    sleep(1);

    // --- delete project ---
    client.delete(`/teams/${team.slug}/projects/${projectId}`, {
        tags: { name: 'delete-teams-projects' },
    });

    sleep(1);
}
