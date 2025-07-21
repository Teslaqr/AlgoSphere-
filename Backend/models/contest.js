const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  userHandle: String,
  numQuestions: Number,
  difficultyDistribution: [Number],
  minRating: Number,
  maxRating: Number,
  duration: Number,
  startTime: Date,
  recency: Number,
  tags: [String],
  shuffle: Boolean,
  problems: [Object],
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);
