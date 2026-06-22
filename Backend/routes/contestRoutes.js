const express = require('express');
const router = express.Router();
const {
  createContest,
  getContestById,
  getContestProgress,
  getContests,
} = require('../controllers/contestController');

router.get('/', getContests);
router.get('/:id/progress', getContestProgress);
router.get('/:id', getContestById);
router.post('/', createContest);

module.exports = router;
