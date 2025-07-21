const express = require('express');
const router = express.Router();
const { createContest } = require('../controllers/contestController');

// Route to create a new contest
router.post('/', createContest);

module.exports = router;
