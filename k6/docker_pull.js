import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';
import encoding from 'k6/encoding';
import { Trend } from 'k6/metrics';

const REGISTRY_URL = __ENV.REGISTRY_URL || 'http://docker.localhost';
const REGISTRY_NAME = __ENV.REGISTRY_NAME || '';

const REPO_BASE = REGISTRY_NAME ? `${REGISTRY_URL}/v2/${REGISTRY_NAME}` : `${REGISTRY_URL}/v2`;

const IMAGES = ['node', 'ubuntu'];
const RANDOM_IMAGES = [...IMAGES].sort(() => Math.random() - 0.5);
const TAG = 'latest';

// One Trend per image for manifest fetches, one for layer (blob) fetches.
// Each Trend yields avg/min/med/max/p(90)/p(95) in k6's default end-of-test summary.
const manifestTrends = {};
const layerTrends = {};
for (const img of IMAGES) {
    manifestTrends[img] = new Trend(`manifest_${img}`, true);
    layerTrends[img] = new Trend(`layer_${img}`, true);
}

// What a real Docker client advertises so the registry can return the right manifest variant.
const MANIFEST_ACCEPT = [
    'application/vnd.docker.distribution.manifest.v2+json',
    'application/vnd.docker.distribution.manifest.list.v2+json',
    'application/vnd.oci.image.manifest.v1+json',
    'application/vnd.oci.image.index.v1+json',
].join(', ');

const PLATFORM = { os: 'linux', architecture: 'amd64' };

const BASIC_AUTH = 'Basic ' + encoding.b64encode(`${__ENV.AUTH_USERNAME}:${__ENV.AUTH_PASSWORD}`);

const MANIFEST_OPTS = {
    headers: {
        Authorization: BASIC_AUTH,
        Accept: MANIFEST_ACCEPT,
    },
    redirects: 0,
    timeout: '60s',
};

const BLOB_OPTS = {
    headers: {},
    redirects: 0,
    timeout: '60s',
};

export const options = {
    insecureSkipTLSVerify: true,
    scenarios: {
        repo: {
            executor: 'per-vu-iterations',
            vus: 1,
            iterations: 200,
        },
    },
};

function parseWWWAuthenticate(header) {
    // Example: Bearer realm="https://auth.example.com/token",service="registry",scope="repository:foo:pull"
    const scheme = header.split(' ')[0];
    const params = {};
    const paramStr = header.substring(scheme.length).trim();
    const re = /(\w+)="([^"]*)"/g;
    let m;
    while ((m = re.exec(paramStr)) !== null) {
        params[m[1]] = m[2];
    }
    return { scheme, params };
}

function fetchAuthToken(wwwAuth) {
    const { params } = parseWWWAuthenticate(wwwAuth);
    if (!params.realm) return null;

    const query = [];
    if (params.service) query.push(`service=${encodeURIComponent(params.service)}`);
    if (params.scope) query.push(`scope=${encodeURIComponent(params.scope)}`);
    const tokenURL = query.length ? `${params.realm}?${query.join('&')}` : params.realm;

    const tokenRes = http.get(tokenURL, {
        headers: { Authorization: BASIC_AUTH },
        timeout: '60s',
    });
    console.log(`Auth token response for ${tokenURL}: ${tokenRes.status}`);
    if (tokenRes.status !== 200) return null;

    const body = tokenRes.json();
    return body.token || body.access_token || null;
}

function withBearer(opts, token) {
    if (!token) return opts;
    return {
        ...opts,
        headers: { ...opts.headers, Authorization: `Bearer ${token}` },
    };
}

function hostOf(url) {
    const m = url.match(/^https?:\/\/([^\/]+)/);
    return m ? m[1] : null;
}

// Follow 301/302 redirects. Same-host redirects (e.g. http→https on the same registry)
// keep the auth headers; cross-host redirects (e.g. to S3 blob storage) drop them.
function followRedirects(res, fromURL, opts) {
    let currentURL = fromURL;
    while ([301, 302].includes(res.status)) {
        const location = res.headers['Location'] || res.headers['location'];
        if (!location) break;
        const sameHost = hostOf(currentURL) === hostOf(location);
        const nextOpts = sameHost
            ? { ...opts, redirects: 0 }
            : { insecureSkipTLSVerify: true, redirects: 0, timeout: '60s' };
        console.log(`Following ${res.status} redirect to ${location} (sameHost=${sameHost})`);
        res = http.get(location, nextOpts);
        console.log(`Redirect response for ${location}: ${res.status} (${res.timings.duration} ms)`);
        currentURL = location;
    }
    return res;
}

// Issue a GET; follow redirects, then on 401 fetch a (possibly differently-scoped) token and retry once.
function getWithAuth(url, opts, token) {
    let res = http.get(url, withBearer(opts, token));
    res = followRedirects(res, url, withBearer(opts, token));

    if (res.status === 401) {
        const wwwAuth = res.headers['Www-Authenticate'] || res.headers['WWW-Authenticate'];
        if (wwwAuth) {
            console.log(`Got 401 on ${url} with WWW-Authenticate: ${wwwAuth}`);
            const newToken = fetchAuthToken(wwwAuth);
            if (newToken) {
                token = newToken;
                res = http.get(url, withBearer(opts, token));
                res = followRedirects(res, url, withBearer(opts, token));
            }
        }
    }
    return { res, token };
}

// Docker Hub short names ("node") map to the "library/" namespace.
// Artifactory (and other registries with an explicit repo key) has no implicit namespace,
// so leave the name as-is when REGISTRY_NAME is set.
function normalizeImage(name) {
    if (REGISTRY_NAME) return name;
    return name.includes('/') ? name : `library/${name}`;
}

// Pick the platform-specific entry from a manifest list / OCI index.
function pickPlatform(manifestList) {
    const entries = manifestList.manifests || [];
    const match = entries.find(e => e.platform &&
        e.platform.os === PLATFORM.os &&
        e.platform.architecture === PLATFORM.architecture);
    return match || entries[0] || null;
}

export default function () {
    let token = null;

    // /v2/ ping — most registries challenge here so we can pre-fetch a token.
    const v2URL = `${REGISTRY_URL}/v2/`;
    const v2Res = http.get(v2URL, MANIFEST_OPTS);
    console.log(`v2 response for ${v2URL}: ${v2Res.status}`);
    if (v2Res.status === 401) {
        const wwwAuth = v2Res.headers['Www-Authenticate'] || v2Res.headers['WWW-Authenticate'];
        if (wwwAuth) {
            console.log(`Got 401 on /v2/ with WWW-Authenticate: ${wwwAuth}`);
            token = fetchAuthToken(wwwAuth);
        }
    }

    const RAW = RANDOM_IMAGES[exec.vu.iterationInInstance % RANDOM_IMAGES.length];
    const IMAGE = normalizeImage(RAW);

    // Manifest fetch — registries often re-challenge with a repo-scoped token here.
    const manifestURL = `${REPO_BASE}/${IMAGE}/manifests/${TAG}`;
    let manifestRes;
    ({ res: manifestRes, token } = getWithAuth(manifestURL, MANIFEST_OPTS, token));
    console.log(`Manifest response for ${manifestURL}: ${manifestRes.status} (${manifestRes.timings.duration} ms)`);
    manifestTrends[RAW].add(manifestRes.timings.duration);
    check(manifestRes, {
        [`Manifest fetched ${IMAGE}`]: (r) => r.status === 200,
    });
    if (manifestRes.status !== 200) {
        sleep(1);
        return;
    }

    const manifest = manifestRes.json();
    let layers = manifest.layers || [];

    // Manifest list / OCI index → walk to the platform-matching manifest.
    if (layers.length === 0 && manifest.manifests && manifest.manifests.length > 0) {
        const entry = pickPlatform(manifest);
        if (entry && entry.digest) {
            const digestURL = `${REPO_BASE}/${IMAGE}/manifests/${entry.digest}`;
            let digestRes;
            ({ res: digestRes, token } = getWithAuth(digestURL, MANIFEST_OPTS, token));
            console.log(`Digest manifest response for ${digestURL}: ${digestRes.status} (${digestRes.timings.duration} ms)`);
            manifestTrends[RAW].add(digestRes.timings.duration);
            check(digestRes, {
                [`Digest manifest fetched ${IMAGE}`]: (r) => r.status === 200,
            });
            if (digestRes.status === 200) {
                layers = digestRes.json().layers || [];
            }
        }
    }

    // Blob downloads — no manifest Accept; redirects (typically to blob storage) handled in getWithAuth.
    for (const layer of layers) {
        const blobURL = `${REPO_BASE}/${IMAGE}/blobs/${layer.digest}`;
        let blobRes;
        ({ res: blobRes, token } = getWithAuth(blobURL, BLOB_OPTS, token));
        console.log(`Blob response for ${blobURL}: ${blobRes.status} (${blobRes.timings.duration} ms)`);
        layerTrends[RAW].add(blobRes.timings.duration);
        check(blobRes, {
            [`Layer ${IMAGE} ${layer.digest} fetched`]: (r) => r.status === 200,
        });
    }
    sleep(1);
}
