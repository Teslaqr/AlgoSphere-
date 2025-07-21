//controller/contestController.js
const Contest = require('../models/contest');
const User = require('../models/user');
const Team = require('../models/team');
const { unwantedContests } = require('../utils/unwantedContests');
const fetchCodeforcesProblems = require('../utils/fetchCodeforcesProblems');

const roundOff = (num) => {
  const remainder = num % 100;
  const randomValue = Math.random();
  return randomValue <= remainder / 100 ? num + (100 - remainder) : num - remainder;
};

const shuffle = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * array.length);
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const createContest = async (req, res) => {
  try {
    const {
      codeforcesId1, codeforcesId2, codeforcesId3,
      numQuestions, lowerDifficulty, upperDifficulty,
      timeLimit, shuffleOrder, tags, contestantType,
      selectedTeam, startsIn, startYear, chooseDifficulty, diffArr
    } = req.body;

    if (!codeforcesId1 || !numQuestions || !timeLimit || shuffleOrder === undefined || !tags || !contestantType || !startsIn || !startYear) {
      return res.status(400).json({ message: 'Fill all the fields', ok: false });
    }

    if (chooseDifficulty === 'false' || chooseDifficulty === 'distributeRandomly') {
      if (!lowerDifficulty || !upperDifficulty) {
        return res.status(400).json({ message: 'Fill all the fields', ok: false });
      }
    } else if (diffArr.length !== numQuestions) {
      return res.status(400).json({ message: 'Incorrect difficulty array', ok: false });
    }

    const uniqueHandles = new Set([codeforcesId1, codeforcesId2, codeforcesId3].filter(Boolean).map(h => h.toLowerCase()));
    if (uniqueHandles.size !== [codeforcesId1, codeforcesId2, codeforcesId3].filter(Boolean).length) {
      return res.status(400).json({ message: 'Duplicate Codeforces handles are not allowed', ok: false });
    }

    const contestants = [];
    const handles = [codeforcesId1, codeforcesId2, codeforcesId3].filter(Boolean);
    for (const handle of handles) {
      const userRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
      const userData = await userRes.json();
      if (userData.status === "FAILED") {
        return res.status(400).json({ message: `Invalid handle: ${handle}`, ok: false });
      }
      contestants.push(userData.result[0].handle);
    }

    if (contestantType === "Team" && contestants.length < 2) {
      return res.status(400).json({ message: "Team mode requires at least 2 participants", ok: false });
    }

    const solvedSet = new Set();
    for (const handle of contestants) {
      const submissions = await fetch(`https://codeforces.com/api/user.status?handle=${handle}&count=10000`);
      const submissionData = await submissions.json();
      if (submissionData.status === "FAILED") {
        return res.status(400).json({ message: `Error with handle: ${handle}`, ok: false });
      }
      submissionData.result.forEach(({ problem }) => {
        if (problem) solvedSet.add(`${problem.contestId}${problem.index}`);
      });
    }

    const allProblems = await fetchCodeforcesProblems();
    const classified = {};
    for (const problem of allProblems) {
      if (!classified[problem.rating]) classified[problem.rating] = [];
      classified[problem.rating].push(problem);
    }

    const startTime = Date.now();
    const newList = [];
    let count = 0;

    // Helper to check problem validity
    const isValidProblem = (problem) =>
      !solvedSet.has(`${problem.contestId}${problem.index}`) &&
      !unwantedContests.includes(problem.contestId) &&
      tags.some(t => problem.tags.includes(t)) &&
      !newList.find(p => p.contestId === problem.contestId && p.index === problem.index);

    const addProblem = (rating) => {
      if (!classified[rating] || classified[rating].length === 0) return false;
      for (let i = 0; i < 50; i++) {
        const idx = Math.floor(Math.random() * classified[rating].length);
        const p = classified[rating][idx];
        if (isValidProblem(p)) {
          newList.push(p);
          return true;
        }
      }
      return false;
    };

    while (newList.length < numQuestions && Date.now() - startTime < 10000) {
      count++;
      if (chooseDifficulty === 'true') {
        const rating = diffArr[newList.length];
        if (!addProblem(rating)) break;
      } else if (chooseDifficulty === 'distributeRandomly') {
        const rating = roundOff(Math.random() * (upperDifficulty - lowerDifficulty)) + Number(lowerDifficulty);
        if (!addProblem(rating)) break;
      } else {
        const delta = (upperDifficulty - lowerDifficulty) / numQuestions;
        const rating = roundOff(Number(lowerDifficulty) + delta * newList.length);
        if (!addProblem(rating)) break;
      }
    }

    if (newList.length < numQuestions) {
      return res.status(200).json({ message: "Unable to fetch enough problems. Try adjusting criteria.", ok: false });
    }

    if (shuffleOrder) shuffle(newList);
    else newList.sort((a, b) => a.rating - b.rating);

    const now = new Date();
    const start = startsIn === "Immediately" ? now : new Date(now.getTime() + startsIn * 60000);
    const end = new Date(start.getTime() + timeLimit * 60000);

    const users = await User.find({ codeforcesId: { $in: contestants } });

    const contest = await Contest.create({
      users,
      problemList: newList,
      contestants,
      numberOfQuestions: numQuestions,
      lowerLimit: lowerDifficulty,
      upperLimit: upperDifficulty,
      timeLimit,
      timeStart: start,
      timeEnding: end,
      contestantType,
      team: selectedTeam !== "Select Team" ? selectedTeam : undefined,
      distributeRandomly: chooseDifficulty === "distributeRandomly",
      chooseDifficulty: chooseDifficulty === "true",
      diffArr: chooseDifficulty !== "false" ? diffArr : undefined,
      startYear,
    });

    return res.status(200).json({ message: "Contest created", id: contest._id, ok: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error", ok: false });
  }
};

module.exports = { createContest };
