const express = require('express');
const { getAllProblems, fetchAndStoreProblems } = require('../controllers/problemController');

const router = express.Router();

router.get('/', getAllProblems);
router.post('/sync', fetchAndStoreProblems);

module.exports = router;
