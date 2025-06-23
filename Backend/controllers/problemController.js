import axios from 'axios';
import Problem from './models/Problem.js';

export const fetchAndStoreProblems = async (req, res) => {
    try {
        const response = await axios.get('https://codeforces.com/api/problemset.problems');
        const problems = response.data.result.problems;
        const problemStats = response.data.result.problemStatistics;

        await Problem.deleteMany({}); // Clear existing data

        const bulk = problems.map((p, idx) => ({
            updateOne: {
                filter: { contestId: p.contestId, index: p.index },
                update: {
                    contestId: p.contestId,
                    index: p.index,
                    name: p.name,
                    type: p.type,
                    rating: p.rating || null,
                    tags: p.tags,
                    url: `https://codeforces.com/problemset/problem/${p.contestId}/${p.index}`,
                    creationTime: new Date()
                },
                upsert: true
            }
        }));

        await Problem.bulkWrite(bulk);
        res.status(200).json({ message: 'Problems fetched and stored successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
