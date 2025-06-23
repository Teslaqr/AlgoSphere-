import express from 'express';
import { fetchAndStoreProblems } from '../controllers/problemController.js';

const router = express.Router();

router.post('/fetch', fetchAndStoreProblems);

export default router;
