// Routes/ResultRoute.js
import express from 'express';
import { submitText } from '../Controllers/submitText.js'; // Use ES import here

const router = express.Router();

// Route for handling text submission
router.post('/submit', submitText);

export default router; // Export using ES module export
