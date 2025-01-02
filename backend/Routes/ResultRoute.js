// Routes/ResultRoute.js
import express from 'express';
import { submitText } from '../Controllers/SubmitOne.js'; // Use ES import here

const router = express.Router();

// Route for handling text submission
router.post('/schoolName', submitText);

export default router; // Export using ES module export
