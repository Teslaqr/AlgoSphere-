const Contest = require('../models/contest');
const codeforces = require('../utils/codeforcesClient');
const fetchCodeforcesProblems = require('../utils/fetchCodeforcesProblems');

const toNumber = (value) => Number(value);

const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const parseStartsIn = (startsIn) => {
  if (startsIn === 'Immediately') return 0;
  const minutes = Number(startsIn);
  return Number.isFinite(minutes) && minutes >= 0 ? minutes : 0;
};

const createContest = asyncHandler(async (req, res) => {
  const {
    codeforcesId1,
    codeforcesId2,
    codeforcesId3,
    numQuestions,
    lowerDifficulty,
    upperDifficulty,
    timeLimit,
    shuffleOrder = true,
    tags = [],
    contestantType = 'Solo',
    selectedTeam,
    startsIn = 0,
    startYear,
    chooseDifficulty = 'distributeRandomly',
    diffArr = [],
  } = req.body;

  const handles = [codeforcesId1, codeforcesId2, codeforcesId3]
    .map((handle) => String(handle || '').trim())
    .filter(Boolean);
  const uniqueHandles = new Set(handles.map((handle) => handle.toLowerCase()));
  const questionCount = toNumber(numQuestions);
  const duration = toNumber(timeLimit);
  const minRating = toNumber(lowerDifficulty);
  const maxRating = toNumber(upperDifficulty);
  const manualRatings = Array.isArray(diffArr) ? diffArr.map(Number) : [];

  if (!handles.length) {
    return res.status(400).json({ message: 'Add at least one Codeforces handle.', ok: false });
  }

  if (uniqueHandles.size !== handles.length) {
    return res.status(400).json({ message: 'Duplicate Codeforces handles are not allowed.', ok: false });
  }

  if (contestantType === 'Team' && handles.length < 2) {
    return res.status(400).json({ message: 'Team mode requires at least 2 participants.', ok: false });
  }

  if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 20) {
    return res.status(400).json({ message: 'Number of questions must be between 1 and 20.', ok: false });
  }

  if (!Number.isFinite(duration) || duration < 1) {
    return res.status(400).json({ message: 'Contest duration must be at least 1 minute.', ok: false });
  }

  if (chooseDifficulty === 'true') {
    if (manualRatings.length !== questionCount || manualRatings.some((rating) => !Number.isFinite(rating))) {
      return res.status(400).json({ message: 'Enter one valid rating for every question.', ok: false });
    }
  } else if (!Number.isFinite(minRating) || !Number.isFinite(maxRating) || minRating > maxRating) {
    return res.status(400).json({ message: 'Enter a valid difficulty range.', ok: false });
  }

  const { handles: contestants, problems } = await fetchCodeforcesProblems({
    handles,
    numQuestions: questionCount,
    lowerDifficulty: minRating,
    upperDifficulty: maxRating,
    shuffleOrder: Boolean(shuffleOrder),
    tags,
    chooseDifficulty,
    diffArr: manualRatings,
    startYear,
  });

  if (problems.length < questionCount) {
    return res.status(422).json({
      message: 'Unable to fetch enough unsolved problems. Try fewer tags or a wider rating range.',
      ok: false,
    });
  }

  const startDelay = parseStartsIn(startsIn);
  const startTime = new Date(Date.now() + startDelay * 60 * 1000);
  const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

  const contest = await Contest.create({
    contestants,
    contestantType,
    selectedTeam: selectedTeam === 'Select Team' ? undefined : selectedTeam,
    numQuestions: questionCount,
    lowerDifficulty: minRating,
    upperDifficulty: maxRating,
    duration,
    startTime,
    endTime,
    startsIn: startDelay,
    startYear: Number(startYear) || undefined,
    tags,
    shuffle: Boolean(shuffleOrder),
    chooseDifficulty,
    difficultyDistribution: chooseDifficulty === 'true' ? manualRatings : [],
    problems,
  });

  return res.status(201).json({
    message: 'Contest created',
    id: contest._id,
    ok: true,
    contest,
  });
});

const getContestById = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({ message: 'Contest not found', ok: false });
  }

  return res.json(contest);
});

const getContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find().sort({ createdAt: -1 }).limit(50);
  return res.json(contests);
});

const getContestProgress = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({ message: 'Contest not found', ok: false });
  }

  const solvedByProblem = {};
  const problemKeys = new Set(contest.problems.map((problem) => codeforces.problemKey(problem)));

  for (const handle of contest.contestants) {
    const solved = await codeforces.getSolvedProblemKeys(handle);
    for (const key of solved) {
      if (!problemKeys.has(key)) continue;
      if (!solvedByProblem[key]) solvedByProblem[key] = [];
      solvedByProblem[key].push(handle);
    }
  }

  return res.json({
    ok: true,
    contestId: contest._id,
    solvedByProblem,
  });
});

module.exports = {
  createContest,
  getContestById,
  getContestProgress,
  getContests,
};
