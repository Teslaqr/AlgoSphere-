import express from 'express';
import { createContest } from '../controllers/contestController.js';

const router = express.Router();

router.post('/create', createContest);

export default router;
