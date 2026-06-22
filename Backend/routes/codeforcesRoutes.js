const express = require('express');
const {
  getApiStatus,
  getUpcomingContests,
  validateHandles,
} = require('../controllers/codeforcesController');

const router = express.Router();

router.get('/status', getApiStatus);
router.get('/validate-handles', validateHandles);
router.get('/upcoming-contests', getUpcomingContests);

module.exports = router;
