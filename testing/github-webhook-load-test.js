import http from 'k6/http';
import { check, sleep } from 'k6';

// Simulation Configuration
const NUM_DEVS = 5000;
const NUM_REPOS = 40;
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'; 

export const options = {
    stages: [
        { duration: '1m', target: 50 },  // Ramp-up to 50 VUs
        { duration: '3m', target: 50 },  // Stay at 50 VUs
        { duration: '1m', target: 0 },   // Ramp-down to 0
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'],
        http_req_failed: ['rate<0.01'],
    },
};

// Data Generation Helpers
const developers = Array.from({ length: NUM_DEVS }, (_, i) => `dev-${i + 1}`);
const repositories = Array.from({ length: NUM_REPOS }, (_, i) => `repo-${i + 1}`);

function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomHex(length) {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

export default function () {
    const dev = getRandomItem(developers);
    const repo = getRandomItem(repositories);
    const eventTypes = ['push', 'pull_request', 'pull_request_review'];
    const eventType = getRandomItem(eventTypes);

    let payload = {};
    const headers = {
        'Content-Type': 'application/json',
        'x-github-event': eventType,
        'Bypass-Tunnel-Reminder': 'true',
    };

    if (eventType === 'push') {
        payload = {
            ref: 'refs/heads/main',
            pusher: { name: dev },
            commits: [
                {
                    id: randomHex(40),
                    message: `Commit by ${dev}`,
                    timestamp: new Date().toISOString(),
                },
            ],
            repository: { name: repo },
            organization: { login: 'acme-corp' },
        };
    } else if (eventType === 'pull_request') {
        payload = {
            action: getRandomItem(['opened', 'closed', 'reopened']),
            pull_request: {
                id: Math.floor(Math.random() * 100000),
                number: Math.floor(Math.random() * 1000),
                title: `Feature by ${dev}`,
                user: { login: dev },
                head: { ref: `feature-${dev}` },
                created_at: new Date().toISOString(),
            },
            repository: { name: repo },
            organization: { login: 'acme-corp' },
        };
    } else if (eventType === 'pull_request_review') {
        payload = {
            action: 'submitted',
            review: {
                id: Math.floor(Math.random() * 100000),
                state: getRandomItem(['approved', 'commented', 'changes_requested']),
                user: { login: dev },
                body: `Review by ${dev}`,
                submitted_at: new Date().toISOString(),
            },
            pull_request: {
                id: Math.floor(Math.random() * 100000),
                number: Math.floor(Math.random() * 1000),
            },
            repository: { name: repo },
            organization: { login: 'acme-corp' },
        };
    }

    const res = http.post(`${BASE_URL}/github/webhook`, JSON.stringify(payload), { headers });

    const isOk = check(res, {
        'status is 200': (r) => r.status === 200,
    });

    if (!isOk) {
        console.log(`Error: Status ${res.status}. Body: ${res.body}`);
    } else {
        try {
            const json = res.json();
            check(res, {
                'response ok': (r) => json.status === 'ok',
            });
        } catch (e) {
            console.log(`Failed to parse JSON: ${res.body}`);
        }
    }

    sleep(1); // Simulate real-world delay between actions
}
