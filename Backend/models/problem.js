// models/problem.js
const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  contestId: Number,
  index: String,
  name: String,
  rating: Number,
  tags: [String],
  url: String
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);
