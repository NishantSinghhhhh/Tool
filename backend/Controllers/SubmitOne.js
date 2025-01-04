
import { answer } from "../data/db.js";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'schools';


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

        console.log("Provided Text:", text);

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

        const userScores = [];

        for (let [username, setid] of userMap) {
            const answerQuery = await answersCollection.findOne({ username });

            if (answerQuery) {
                const setAnswers = answer.find((set) => set.setId === setid);

                if (setAnswers) {
                    const userAnswers = answerQuery.answers;
                    let totalMarks = 0;
                    let section1Marks = 0;
                    let section2Marks = 0;
                    let section3Marks = 0;

                    Object.keys(setAnswers.answers).forEach((questionNumber) => {
                        const correctAnswer = setAnswers.answers[questionNumber];
                        const userAnswer = userAnswers[questionNumber];

                        if (userAnswer === "") {
                            // Do nothing for unattempted questions
                        } else if (userAnswer === correctAnswer) {
                            totalMarks += 4; // Add 4 marks for correct answers
                            if (questionNumber >= 1 && questionNumber <= 10) {
                                section1Marks += 4;
                            } else if (questionNumber >= 11 && questionNumber <= 20) {
                                section2Marks += 4;
                            } else if (questionNumber >= 21 && questionNumber <= 25) {
                                section3Marks += 4;
                            }
                        } else {
                            totalMarks -= 1; // Deduct 1 mark for incorrect answers
                            if (questionNumber >= 1 && questionNumber <= 10) {
                                section1Marks -= 1;
                            } else if (questionNumber >= 11 && questionNumber <= 20) {
                                section2Marks -= 1;
                            } else if (questionNumber >= 21 && questionNumber <= 25) {
                                section3Marks -= 1;
                            }
                        }
                    });

                    userScores.push({
                        username,
                        totalMarks,
                        section1Marks,
                        section2Marks,
                        section3Marks,
                    });
                }
            }
        }

        console.log('User Scores:', userScores);

        // Send user scores and matching user information to the frontend
        res.status(200).json({
            success: true,
            message: matchingUsers.length > 0 ? 'Matching users found and scores calculated!' : 'No matching users found.',
            userInfo: matchingUsers, // Array of matching user objects
            scores: userScores, // Array of user scores with section-wise details
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
