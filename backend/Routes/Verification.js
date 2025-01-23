import express from 'express';
import { verification } from '../Controllers/Verification.js';

const router = express.Router();

router.post('/all', verification);

export default router;
