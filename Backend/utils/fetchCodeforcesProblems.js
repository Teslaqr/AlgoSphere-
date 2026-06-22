const codeforces = require('./codeforcesClient');
const { unwantedContests } = require('./unwantedContests');

const roundOff = (num) => {
  const rem = Math.abs(num % 100);
  return Math.random() < rem / 100 ? num + (100 - rem) : num - rem;
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const { problemKey } = codeforces;

const normalizeProblem = (problem) => ({
  contestId: problem.contestId,
  index: problem.index,
  name: problem.name,
  type: problem.type,
  rating: problem.rating,
  tags: problem.tags || [],
  url: `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
});

const minimumContestByYear = (year) => {
  const map = {
    2018: 912,
    2019: 1097,
    2020: 1284,
    2021: 1472,
    2022: 1621,
    2023: 1770,
    2024: 1900,
    2025: 2000,
  };

  const numericYear = Number(year);
  if (!numericYear || numericYear <= 2017) return 0;
  return map[numericYear] || 0;
};

const ratingPlan = ({
  numQuestions,
  lowerDifficulty,
  upperDifficulty,
  chooseDifficulty,
  diffArr,
}) => {
  if (chooseDifficulty === 'true') {
    return diffArr.map(Number);
  }

  if (chooseDifficulty === 'false') {
    if (numQuestions === 1) return [Number(lowerDifficulty)];
    const step = (Number(upperDifficulty) - Number(lowerDifficulty)) / (numQuestions - 1);
    return Array.from({ length: numQuestions }, (_, index) => roundOff(Number(lowerDifficulty) + step * index));
  }

  return Array.from({ length: numQuestions }, () => {
    const low = Number(lowerDifficulty);
    const high = Number(upperDifficulty);
    return roundOff(low + Math.random() * (high - low));
  });
};

const fetchContestProblems = async ({
  handles,
  numQuestions,
  lowerDifficulty,
  upperDifficulty,
  shuffleOrder,
  tags,
  chooseDifficulty,
  diffArr,
  startYear,
}) => {
  const users = await codeforces.getUserInfo(handles);
  const canonicalHandles = users.map((user) => user.handle);

  const problemset = await codeforces.getProblemset();

  const solvedSet = new Set();
  for (const handle of canonicalHandles) {
    const userSolved = await codeforces.getSolvedProblemKeys(handle);
    for (const key of userSolved) {
      solvedSet.add(key);
    }
  }

  const selectedTags = Array.isArray(tags) ? tags.filter(Boolean) : [];
  const minContestId = minimumContestByYear(startYear);
  const selectedKeys = new Set();
  const byRating = new Map();

  for (const problem of problemset.problems) {
    if (!problem.contestId || !problem.index || !problem.rating) continue;
    if (unwantedContests.includes(problem.contestId)) continue;
    if (problem.contestId < minContestId) continue;
    if (solvedSet.has(problemKey(problem))) continue;
    if (selectedTags.length && !selectedTags.some((tag) => problem.tags?.includes(tag))) continue;

    if (!byRating.has(problem.rating)) byRating.set(problem.rating, []);
    byRating.get(problem.rating).push(problem);
  }

  for (const pool of byRating.values()) {
    shuffle(pool);
  }

  const difficulties = ratingPlan({
    numQuestions,
    lowerDifficulty,
    upperDifficulty,
    chooseDifficulty,
    diffArr,
  });

  const picked = [];
  const candidateOffsets = [0, -100, 100, -200, 200, -300, 300, -400, 400];

  for (const desiredRating of difficulties) {
    let chosen = null;

    for (const offset of candidateOffsets) {
      const rating = desiredRating + offset;
      const pool = byRating.get(rating) || [];
      chosen = pool.find((problem) => !selectedKeys.has(problemKey(problem)));
      if (chosen) break;
    }

    if (chosen) {
      selectedKeys.add(problemKey(chosen));
      picked.push(normalizeProblem(chosen));
    }
  }

  if (picked.length < numQuestions) {
    const fallbackPool = [...byRating.values()].flat().sort((a, b) => a.rating - b.rating);
    for (const problem of fallbackPool) {
      if (picked.length >= numQuestions) break;
      if (selectedKeys.has(problemKey(problem))) continue;

      selectedKeys.add(problemKey(problem));
      picked.push(normalizeProblem(problem));
    }
  }

  if (shuffleOrder) shuffle(picked);
  else picked.sort((a, b) => (a.rating || 0) - (b.rating || 0));

  return {
    handles: canonicalHandles,
    problems: picked,
  };
};

module.exports = fetchContestProblems;
