import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';
import encoding from 'k6/encoding';
import exec from 'k6/execution';

const REGISTRY_URL = __ENV.REGISTRY_URL || 'http://artifactory.localhost';
const REGISTRY_NAME = __ENV.REGISTRY_NAME || 'test-generic';
const AUTH_USERNAME = __ENV.AUTH_USERNAME || 'admin';
const AUTH_PASSWORD = __ENV.AUTH_PASSWORD || 'password';

// Single source of truth for the ramp schedule — shared durations, per-scenario VU targets.
const STAGES = [
    { name: 's', duration: 20, targets: { aql: 10, up: 10, meta: 10, down: 100 } },
    { name: 'm', duration: 20, targets: { aql: 20, up: 20, meta: 20, down: 150 } },
    { name: 'l', duration: 20, targets: { aql: 40, up: 40, meta: 40, down: 200 } },
];
// Single source of truth for scenarios — name, exec function, and description.
// The `scenarios` block in `options` and the summary loop are both built from this.
const SCENARIOS = [
    {
        name: 'aql',
        exec: 'aqlSearch',
        description: 'AQL search queries',
    },
    {
        name: 'up',
        exec: 'uploadSmallArtifacts',
        description: 'Upload many small files with properties',
    },
    {
        name: 'meta',
        exec: 'metadataQueries',
        description: 'Metadata and file info lookups',
    },
    {
        name: 'down',
        exec: 'downloadArtifacts',
        description: 'Download random artifacts',
    },
];

function stagesFor(scenario) {
    return STAGES.map((s) => ({ duration: `${s.duration}s`, target: s.targets[scenario] }));
}

function buildScenarios() {
    return Object.fromEntries(
        SCENARIOS.map((s) => [
            s.name,
            {
                executor: 'ramping-vus',
                exec: s.exec,
                startVUs: 0,
                stages: stagesFor(s.name),
                gracefulRampDown: '60s',
                gracefulStop: '60s',
            },
        ])
    );
}

// Derive the current stage from elapsed scenario time. k6's `scenario` tag is automatic;
// we attach this as a `stage` tag on every request to get per-stage sub-metrics.
function currentStage() {
    const elapsed = (Date.now() - exec.scenario.startTime) / 1000;
    let c = 0;
    for (let i = 0; i < STAGES.length; i++) {
        c += STAGES[i].duration;
        if (elapsed < c) return STAGES[i].name;
    }
    return STAGES[STAGES.length - 1].name;
}

// Sub-metrics only appear in handleSummary's data.metrics when a threshold references them,
// so declare always-passing thresholds for every scenario×stage×metric combo we want to report.
function buildThresholds() {
    const t = {
        http_req_duration: ['p(95)<5000'],
        http_req_failed: ['rate<0.1'],
    };
    for (const s of SCENARIOS) {
        for (const st of STAGES) {
            const tag = `{scenario:${s.name},stage:${st.name}}`;
            t[`http_req_duration${tag}`] = ['p(95)>=0'];
            t[`http_req_failed${tag}`] = ['rate>=0'];
            t[`http_reqs${tag}`] = ['count>=0'];
        }
    }
    return t;
}

const AUTH_HEADER = {
    headers: {
        Authorization: 'Basic ' + encoding.b64encode(`${AUTH_USERNAME}:${AUTH_PASSWORD}`),
        'Content-Type': 'application/json',
    },
    timeout: '60s',
};

const UPLOAD_HEADER = {
    headers: {
        Authorization: 'Basic ' + encoding.b64encode(`${AUTH_USERNAME}:${AUTH_PASSWORD}`),
        'Content-Type': 'application/octet-stream',
    },
    timeout: '60s',
};

export const options = {
    insecureSkipTLSVerify: true,
    scenarios: buildScenarios(),
    thresholds: buildThresholds(),
};

export function setup() {
    console.log(`REGISTRY_URL: ${REGISTRY_URL}`);
}


// --- Scenario 1: AQL searches ---
// AQL queries are the most DB-intensive operation in Artifactory.
// Each query parses, plans, and executes against the DB with no artifact-level cache.
// Wildcard and regex patterns force full table scans.
export function aqlSearch() {
    const queries = [
        // Wildcard search — forces scanning across all artifacts
        `items.find({"repo":"${REGISTRY_NAME}","name":{"$match":"*"}}).include("name","repo","path","size","created","modified","sha256")`,
        // Property-based search — joins the node_props table
        `items.find({"$or":[{"property.key":"docker.manifest"},{"property.key":"docker.repoName"}]}).include("name","repo","path","property")`,
        // Deep path search with sorting — expensive ORDER BY on large result sets
        `items.find({"repo":"${REGISTRY_NAME}","type":"file"}).include("name","repo","path","size","created").sort({"$desc":["created"]}).limit(500)`,
        // Stat-based search — joins the stats table
        `items.find({"stat.downloads":{"$gt":0}}).include("name","repo","path","stat")`,
        // Multi-repo wildcard — scans across all repositories
        `items.find({"name":{"$match":"*.json"}}).include("name","repo","path","size","sha256","created","modified")`,
        // Created-date range search — forces index range scan
        `items.find({"created":{"$last":"30d"},"type":"file"}).include("name","repo","path","size","created").sort({"$asc":["size"]}).limit(1000)`,
    ];

    const query = queries[randomIntBetween(0, queries.length - 1)];
    const stageTag = { stage: currentStage() };

    const res = http.post(
        `${REGISTRY_URL}/artifactory/api/search/aql`,
        query,
        {
            headers: {
                Authorization: AUTH_HEADER.headers.Authorization,
                'Content-Type': 'text/plain',
            },
            timeout: '60s',
            tags: stageTag,
        }
    );

    check(res, {
        'AQL status is 200': (r) => r.status === 200,
    });
}

// --- Scenario 2: Upload many small artifacts with properties ---
// Each upload creates DB entries for: node, checksum (md5+sha1+sha256), properties, stats.
// Small files maximize DB writes per byte transferred — the overhead is in the metadata, not the payload.
// Adding multiple properties per artifact multiplies the DB inserts.
export function uploadSmallArtifacts() {
    const vu = __VU;
    const iter = __ITER;
    const artifactName = `stress-${vu}-${iter}-${randomString(8)}.json`;
    const artifactPath = `k6-stress/run-${vu}/${artifactName}`;

    // Small payload — we want DB overhead, not network overhead
    const payload = JSON.stringify({
        test: true,
        vu: vu,
        iter: iter,
        ts: Date.now(),
        data: randomString(64),
    });

    // Upload with multiple matrix properties — each becomes a separate DB row in node_props
    const propsString = [
        `build.name=k6-stress`,
        `build.number=${iter}`,
        `test.vu=${vu}`,
        `test.run=${randomString(6)}`,
        `test.env=loadtest`,
        `test.timestamp=${Date.now()}`,
    ].join(';');

    const stageTag = { stage: currentStage() };

    const res = http.put(
        `${REGISTRY_URL}/artifactory/${REGISTRY_NAME}/${artifactPath};${propsString}`,
        payload,
        { ...UPLOAD_HEADER, tags: stageTag }
    );

    check(res, {
        'Upload status is 2xx': (r) => r.status >= 200 && r.status < 300,
    });

    // Immediately request file info — forces the DB to read back what it just wrote (cache miss)
    const infoRes = http.get(
        `${REGISTRY_URL}/artifactory/api/storage/${REGISTRY_NAME}/${artifactPath}`,
        { ...AUTH_HEADER, tags: stageTag }
    );

    check(infoRes, {
        'File info status is 200': (r) => r.status === 200,
    });
}

// --- Scenario 3: Metadata and storage info queries ---
// File info, properties, and folder listing all bypass the artifact cache and query the DB.
// Recursive folder listings are especially expensive as they walk the node tree in the DB.
export function metadataQueries() {
    const endpoints = [
        // Storage info for the repo root — aggregates sizes across all nodes
        `/artifactory/api/storage/${REGISTRY_NAME}`,
        // Recursive folder listing — tree traversal in the DB
        `/artifactory/api/storage/${REGISTRY_NAME}?list&deep=1&listFolders=1`,
        // Storage summary — the most expensive single query, aggregates across ALL repos
        `/artifactory/api/storageinfo`,
        // Repository configuration — reads from config DB tables
        `/artifactory/api/repositories/${REGISTRY_NAME}`,
        // System-wide storage summary
        `/artifactory/api/system/usage`,
        // Search by checksum — forces a lookup in the checksum index
        `/artifactory/api/search/checksum?sha256=${randomString(64, '0123456789abcdef')}`,
        // GAVC search with wildcards — expensive multi-table join
        `/artifactory/api/search/gavc?g=*&a=*&v=*&repos=${REGISTRY_NAME}`,
        // File list with stat info — joins stats for every file in the response
        `/artifactory/api/storage/${REGISTRY_NAME}?list&deep=1&mdTimestamps=1&statsTimestamps=1&includeRootPath=1`,
    ];

    const endpoint = endpoints[randomIntBetween(0, endpoints.length - 1)];
    const stageTag = { stage: currentStage() };

    const res = http.get(`${REGISTRY_URL}${endpoint}`, { ...AUTH_HEADER, tags: stageTag });

    check(res, {
        'Metadata query responded': (r) => r.status < 500,
    });
}

// --- Scenario 4: Download random artifacts ---
// Names are random (produced by the upload scenario), so we discover what exists at runtime
// via a recursive storage listing, cache it per VU, then pick a random entry to download.
// The listing call itself is only made once per VU, so the scenario's cost is dominated by downloads.
const artifactCache = {};
function loadArtifactPaths(stageTag) {
    const listRes = http.get(
        `${REGISTRY_URL}/artifactory/api/storage/${REGISTRY_NAME}?list&deep=1`,
        { ...AUTH_HEADER, tags: { ...stageTag, op: 'list' } }
    );
    if (listRes.status !== 200) return [];
    try {
        const body = listRes.json();
        return (body.files || [])
            .filter((f) => !f.folder)
            .map((f) => f.uri.replace(/^\//, ''));
    } catch (_) {
        return [];
    }
}

export function downloadArtifacts() {
    const stageTag = { stage: currentStage() };

    let paths = artifactCache[__VU];
    if (!paths || paths.length === 0) {
        paths = loadArtifactPaths(stageTag);
        artifactCache[__VU] = paths;
    }

    if (paths.length === 0) {
        // Nothing to download yet — uploads may not have produced files, or listing failed.
        sleep(1);
        return;
    }

    const artifactPath = paths[randomIntBetween(0, paths.length - 1)];
    const downloadRes = http.get(
        `${REGISTRY_URL}/artifactory/${REGISTRY_NAME}/${artifactPath}`,
        { ...AUTH_HEADER, tags: stageTag }
    );

    check(downloadRes, {
        'Download status is 200': (r) => r.status === 200,
    });
}