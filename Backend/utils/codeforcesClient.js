const crypto = require('crypto');
const fetch = require('node-fetch');

const BASE_URL = 'https://codeforces.com/api';
const MIN_INTERVAL_MS = Number(process.env.CF_MIN_INTERVAL_MS) || 2100;

let lastRequestAt = 0;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getCredentials = () => ({
  apiKey: process.env.CF_API_KEY || process.env.CODEFORCES_API_KEY || process.env.key,
  apiSecret: process.env.CF_API_SECRET || process.env.CODEFORCES_API_SECRET || process.env.secret,
});

const shouldSignRequests = () => {
  const { apiKey, apiSecret } = getCredentials();
  return Boolean(apiKey && apiSecret && process.env.CF_USE_AUTH !== 'false');
};

const normalizeParams = (params = {}) => {
  const normalized = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    normalized.push([key, String(value)]);
  }

  return normalized.sort(([keyA, valueA], [keyB, valueB]) => {
    if (keyA === keyB) return valueA.localeCompare(valueB);
    return keyA.localeCompare(keyB);
  });
};

const buildQuery = (params) => (
  normalizeParams(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
);

const addSignature = (methodName, params) => {
  const { apiKey, apiSecret } = getCredentials();
  if (!apiKey || !apiSecret) return params;

  const rand = crypto.randomBytes(3).toString('hex');
  const signedParams = {
    ...params,
    apiKey,
    time: Math.floor(Date.now() / 1000),
  };
  const signatureQuery = normalizeParams(signedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  const hash = crypto
    .createHash('sha512')
    .update(`${rand}/${methodName}?${signatureQuery}#${apiSecret}`)
    .digest('hex');

  return {
    ...signedParams,
    apiSig: `${rand}${hash}`,
  };
};

const waitForTurn = async () => {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed);
  }
  lastRequestAt = Date.now();
};

const request = async (methodName, params = {}, options = {}) => {
  const useAuth = options.auth ?? shouldSignRequests();
  const requestParams = useAuth ? addSignature(methodName, params) : params;
  const query = buildQuery(requestParams);
  const url = `${BASE_URL}/${methodName}${query ? `?${query}` : ''}`;

  await waitForTurn();

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== 'OK') {
    const error = new Error(data.comment || `Codeforces API ${methodName} failed`);
    error.status = 502;
    error.codeforces = data;
    throw error;
  }

  return data.result;
};

const getUserInfo = (handles) => {
  const handleList = Array.isArray(handles) ? handles : [handles];
  return request('user.info', { handles: handleList.join(';') });
};

const getUserSubmissions = (handle, count = 10000) => (
  request('user.status', { handle, count })
);

const getProblemset = (tags) => (
  request('problemset.problems', { tags: Array.isArray(tags) ? tags.join(';') : tags })
);

const getContests = ({ gym = false } = {}) => (
  request('contest.list', { gym: gym ? 'true' : 'false' })
);

const problemKey = (problem) => `${problem.contestId}-${problem.index}`;

const getSolvedProblemKeys = async (handle) => {
  const submissions = await getUserSubmissions(handle);
  const solved = new Set();

  for (const submission of submissions) {
    if (submission.verdict === 'OK' && submission.problem?.contestId && submission.problem?.index) {
      solved.add(problemKey(submission.problem));
    }
  }

  return solved;
};

module.exports = {
  getContests,
  getCredentials,
  getProblemset,
  getSolvedProblemKeys,
  getUserInfo,
  getUserSubmissions,
  problemKey,
  request,
  shouldSignRequests,
};
