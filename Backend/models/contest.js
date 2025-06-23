import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    userHandle: String,
    numQuestions: Number,
    difficultyDistribution: String,
    minRating: Number,
    maxRating: Number,
    duration: Number,
    startTime: Date,
    recency: Number,
    tags: [String],
    shuffle: Boolean,
    problems: [Object]
}, { timestamps: true });

export default mongoose.model('Contest', contestSchema);
