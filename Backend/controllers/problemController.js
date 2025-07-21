import axios from 'axios';
import Problem from '../models/problem.js';



export const getAllProblems = async (req, res) => {
  try {
    const problems = await Problem.find();
    res.json(problems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


export const fetchAndStoreProblems = async (req, res) => {
  try {
    const { data } = await axios.get('https://codeforces.com/api/problemset.problems');

    const problems = data.result.problems.map((p) => ({
      contestId: p.contestId,
      index: p.index,
      name: p.name,
      type: p.type,
      rating: p.rating || 0,
      tags: p.tags || [],
      url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
      creationTime: new Date((p.creationTimeSeconds || Date.now() / 1000) * 1000),
    }));

    // optional: clear old problems
    await Problem.deleteMany({});

    // bulk insert
    await Problem.insertMany(problems);

    res.status(200).json({ message: 'Problems fetched and stored', count: problems.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
