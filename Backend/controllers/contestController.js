import Contest from './models/Contest.js';
import Problem from './models/Problem.js';

export const createContest = async (req, res) => {
    try {
        const {
            userHandle,
            numQuestions,
            difficultyDistribution,
            minRating,
            maxRating,
            duration,
            startTime,
            recency,
            tags,
            shuffle
        } = req.body;

        const filter = {
            rating: { $gte: minRating, $lte: maxRating }
        };

        if (tags.length > 0) {
            filter.tags = { $in: tags };
        }

        const fromYear = recency || 2019;
        const fromDate = new Date(`${fromYear}-01-01`);
        filter.createdAt = { $gte: fromDate };

        const allProblems = await Problem.find(filter);

        if (allProblems.length < numQuestions) {
            return res.status(400).json({ message: "Not enough problems match your criteria." });
        }

        let selectedProblems = allProblems;

        if (shuffle) {
            selectedProblems = selectedProblems.sort(() => 0.5 - Math.random());
        }

        selectedProblems = selectedProblems.slice(0, numQuestions);

        const contest = new Contest({
            userHandle,
            numQuestions,
            difficultyDistribution,
            minRating,
            maxRating,
            duration,
            startTime: startTime ? new Date(startTime) : new Date(),
            recency,
            tags,
            shuffle,
            problems: selectedProblems
        });

        await contest.save();
        res.status(201).json(contest);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
