// utils/fetchCodeforcesProblems.js
const fetch = require('node-fetch');
const { unwantedContests } = require('./unwantedContests');

// Helper: round rating to 100s with randomness
const roundOff = (num) => {
  const rem = num % 100;
  return Math.random() < rem / 100 ? num + (100 - rem) : num - rem;
};

// Helper: shuffle an array
const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (array.length - 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Main fetch function (you'll pass all frontend form data here)
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
  const timeLimitMillis = 10000;
  const startTime = Date.now();

  // Get full problemset
  const response = await fetch('https://codeforces.com/api/problemset.problems');
  const data = await response.json();
  if (data.status !== "OK") throw new Error("Codeforces problemset fetch failed");

  // Group by rating
  const classified = {};
  for (const problem of data.result.problems) {
    if (!classified[problem.rating]) classified[problem.rating] = [];
    classified[problem.rating].push(problem);
  }

  // Fetch solved problems for each user
  const solvedSet = new Set();
  for (const handle of handles) {
    const count = Math.floor(Math.random() * 1000) + 10000;
    const res = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&count=${count}`);
    const json = await res.json();
    if (json.status !== "OK") throw new Error(`Invalid handle ${handle}`);
    for (const sub of json.result) {
      solvedSet.add(`${sub.problem.contestId}${sub.problem.index}`);
    }
  }

  // Main logic to pick problems
  const newList = [];
  let count = 0;

  const filterValid = (p) =>
    !solvedSet.has(`${p.contestId}${p.index}`) &&
    !unwantedContests.includes(p.contestId) &&
    p.tags.some(t => tags.includes(t));

  const includeByYear = (p) => {
    const map = {
      '2022': 1621,
      '2021': 1472,
      '2020': 1284,
      '2019': 1097,
      '2018': 912
    };
    return p.contestId >= map[startYear];
  };

  if (chooseDifficulty === 'false') {
    const delta = (upperDifficulty - lowerDifficulty) / numQuestions;
    let ratingStart = lowerDifficulty;

    while (newList.length < numQuestions) {
      if (Date.now() - startTime > timeLimitMillis || count > 100000) break;

      const rating = roundOff(ratingStart + Math.random() * delta);
      const pool = classified[rating] || [];
      const chosen = pool.find(p => filterValid(p) && includeByYear(p));
      if (chosen && !newList.includes(chosen)) newList.push(chosen);

      ratingStart += delta;
      count++;
    }
  } else if (chooseDifficulty === 'true') {
    for (let i = 0; i < diffArr.length; i++) {
      const rating = diffArr[i];
      const pool = classified[rating] || [];
      const chosen = pool.find(p => filterValid(p) && includeByYear(p));
      if (chosen && !newList.includes(chosen)) newList.push(chosen);
    }
  } else if (chooseDifficulty === 'distributeRandomly') {
    while (newList.length < numQuestions && count < 100000) {
      const rating = roundOff(Math.random() * (upperDifficulty - lowerDifficulty)) + lowerDifficulty;
      const pool = classified[rating] || [];
      const chosen = pool.find(p => filterValid(p) && includeByYear(p));
      if (chosen && !newList.includes(chosen)) newList.push(chosen);
      count++;
    }
  }

  if (shuffleOrder) shuffle(newList);
  else if (chooseDifficulty !== 'true') newList.sort((a, b) => a.rating - b.rating);

  return newList;
};

module.exports = fetchContestProblems;
