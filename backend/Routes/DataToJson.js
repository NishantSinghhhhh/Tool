// Routes/ResultRoute.js
import express from 'express';
import { SchoolRanking } from '../Controllers/DataToJson.js'; // Use ES import here
import { SchoolFrequecny } from '../Controllers/DataToJson.js'; // Use ES import here
import { AllSchool } from '../Controllers/DataToJson.js'; // Use ES import here

const router = express.Router();

// Route for handling text submission
router.post('/SchoolRanking', SchoolRanking);
router.post('/SchoolFrequecny', SchoolFrequecny);
router.post('/AllSchool', AllSchool);

export default router; // Export using ES module export
