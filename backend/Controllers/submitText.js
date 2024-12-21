import { answer } from "../db.js"; // Import the predefined answers from db.js
import { MongoClient } from 'mongodb'; // ES Module import
import dotenv from 'dotenv';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'test';

export const submitText = async (req, res) => {
    const { text } = req.body;

    if (!text || text.trim() === '') {
        return res.status(400).json({ success: false, message: 'Text is required!' });
    }

    const client = new MongoClient(mongo_url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection('users');
        const answersCollection = db.collection('answers');

        // Directly use the provided text
        console.log("Provided Text:", text);

        // Query users where the school name matches text with or without commas
        const matchingUsers = await usersCollection.find({
            $or: [
                { schoolName: text },
                { schoolName: text.replace(/,/g, '') }
            ]
        }).toArray();

        console.log("Matching Users:", matchingUsers);

        const userMap = new Map();

        matchingUsers.forEach(user => {
            console.log("Matched School Name:", user.schoolName);
            userMap.set(user.username, user.setid);
        });

        const userScores = new Map();

        for (let [username, setid] of userMap) {
            const answerQuery = await answersCollection.findOne({ username });

            if (answerQuery) {
                const setAnswers = answer.find((set) => set.setId === setid);

                if (setAnswers) {
                    const userAnswers = answerQuery.answers;
                    let marks = 0;

                    Object.keys(setAnswers.answers).forEach((questionNumber) => {
                        const correctAnswer = setAnswers.answers[questionNumber];
                        const userAnswer = userAnswers[questionNumber];

                        if (userAnswer === correctAnswer) {
                            marks += 4; // Correct answer
                        } else {
                            marks -= 1; // Incorrect answer
                        }
                    });

                    userScores.set(username, marks);
                }
            }
        }

        console.log('User Scores:', userScores);

        // Send both user info and scores to the frontend
        res.status(200).json({
            success: true,
            message: matchingUsers.length > 0 ? 'Matching users found and scores calculated!' : 'No matching users found.',
            userInfo: matchingUsers, // Array of matching user objects
            scores: Array.from(userScores), // Convert Map to an array
        });

    } catch (error) {
        console.error('Error searching for users or answers:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while searching for users or answers.',
        });
    } finally {
        client.close();
    }
};
