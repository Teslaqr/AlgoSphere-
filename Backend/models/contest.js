const mongoose = require('mongoose');

const problemSnapshotSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  type: String,
  rating: Number,
  tags: [String],
  url: String,
}, { _id: false });

const contestSchema = new mongoose.Schema({
  contestants: {
    type: [String],
    required: true,
  },
  contestantType: {
    type: String,
    enum: ['Solo', 'Team'],
    default: 'Solo',
  },
  selectedTeam: String,
  numQuestions: {
    type: Number,
    required: true,
  },
  lowerDifficulty: Number,
  upperDifficulty: Number,
  duration: {
    type: Number,
    required: true,
  },
  startTime: Date,
  endTime: Date,
  startsIn: Number,
  startYear: Number,
  tags: [String],
  shuffle: Boolean,
  chooseDifficulty: {
    type: String,
    enum: ['false', 'true', 'distributeRandomly'],
    default: 'distributeRandomly',
  },
  difficultyDistribution: [Number],
  problems: [problemSnapshotSchema],
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
