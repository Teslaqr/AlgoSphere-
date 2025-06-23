import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
    contestId: Number,
    index: String,
    name: String,
    type: String,
    rating: Number,
    tags: [String],
    url: String,
    creationTime: Date
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
