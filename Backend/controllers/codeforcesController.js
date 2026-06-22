const codeforces = require('../utils/codeforcesClient');

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const parseHandles = (value) => (
  String(value || '')
    .split(',')
    .map((handle) => handle.trim())
    .filter(Boolean)
);

const getApiStatus = asyncHandler(async (req, res) => {
  const credentials = codeforces.getCredentials();

  return res.json({
    ok: true,
    authenticated: codeforces.shouldSignRequests(),
    hasKey: Boolean(credentials.apiKey),
    hasSecret: Boolean(credentials.apiSecret),
    minIntervalMs: Number(process.env.CF_MIN_INTERVAL_MS) || 2100,
  });
});

const validateHandles = asyncHandler(async (req, res) => {
  const handles = parseHandles(req.query.handles);

  if (!handles.length) {
    return res.status(400).json({ ok: false, message: 'Pass handles as a comma-separated query parameter.' });
  }

  const users = await codeforces.getUserInfo(handles);

  return res.json({
    ok: true,
    users: users.map((user) => ({
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank,
      avatar: user.avatar,
    })),
  });
});

const getUpcomingContests = asyncHandler(async (req, res) => {
  const contests = await codeforces.getContests({ gym: req.query.gym === 'true' });
  const upcoming = contests
    .filter((contest) => contest.phase === 'BEFORE')
    .sort((a, b) => a.startTimeSeconds - b.startTimeSeconds)
    .map((contest) => ({
      id: contest.id,
      name: contest.name,
      type: contest.type,
      phase: contest.phase,
      durationSeconds: contest.durationSeconds,
      startTimeSeconds: contest.startTimeSeconds,
      relativeTimeSeconds: contest.relativeTimeSeconds,
    }));

  return res.json({ ok: true, contests: upcoming });
});

module.exports = {
  getApiStatus,
  getUpcomingContests,
  validateHandles,
};
