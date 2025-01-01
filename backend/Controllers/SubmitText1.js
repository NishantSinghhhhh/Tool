import { answer } from "../data/db.js"; // Predefined answers from db.js
import { Solutions } from "../data/answers.js";
import { mockUsers } from "../data/user.js";

export const submitText = async (req, res) => {
    const { text } = req.body;

    console.log("==> Received Request Body:", req.body);

    if (!text || text.trim() === "") {
        console.error("Validation Error: 'text' is required!");
        return res.status(400).json({ success: false, message: "Text is required!" });
    }

    console.log("==> Searching for Users with School Name:", text);

    // Step 1: Find users with the matching school name
    const matchingUsers = mockUsers.filter(
        user => user.schoolName === text || user.schoolName === text.replace(/,/g, "")
    );

    console.log("==> Matching Users Found:", JSON.stringify(matchingUsers, null, 2));

    if (matchingUsers.length === 0) {
        console.warn("No users found for the provided school name:", text);
        return res.status(404).json({
            success: false,
            message: "No users found for the provided school name."
        });
    }

    // Step 2: Create a map to store username and setId
    const userMap = new Map();
    matchingUsers.forEach(user => {
        userMap.set(user.username, user.setid);
    });

    console.log("==> User Map (username -> setId):", Array.from(userMap));

    // Step 3: Calculate scores for each user
    const userScores = new Map();

    userMap.forEach((setid, username) => {
        console.log(`\n==> Calculating Score for User: ${username}, Set ID: ${setid}`);

        // Find the user's answers from Solutions
        const userSolution = Solutions.find(solution => solution.username === username);

        if (!userSolution) {
            console.warn(`No solution found for username: ${username}`);
            return;
        }

        console.log(`User Solution Found for ${username}:`, JSON.stringify(userSolution, null, 2));

        // Find the correct answers for the setId
        const correctAnswers = answer.find(ans => ans.setId === setid);

        if (!correctAnswers) {
            console.warn(`No correct answers found for setId: ${setid}`);
            return;
        }

        console.log(`Correct Answers for Set ID ${setid}:`, JSON.stringify(correctAnswers, null, 2));

        const userAnswers = userSolution.answers;
        let marks = 0;

        // Compare user answers with correct answers
        Object.keys(correctAnswers.answers).forEach(questionNumber => {
            const correctAnswer = correctAnswers.answers[questionNumber];
            const userAnswer = userAnswers[questionNumber];

            if (userAnswer === correctAnswer) {
                marks += 4; // Correct answer
                console.log(`Question ${questionNumber}: Correct (Marks +4)`);
            } else {
                marks -= 1; // Incorrect answer
                console.log(`Question ${questionNumber}: Incorrect (Marks -1)`);
            }
        });

        console.log(`Total Score for ${username}: ${marks}`);
        userScores.set(username, marks);
    });

    console.log("\n==> Final User Scores:", Array.from(userScores));

    res.status(200).json({
        success: true,
        message: "Matching users found and scores calculated!",
        userInfo: matchingUsers, // Array of matching user objects
        scores: Array.from(userScores) // Convert Map to an array for JSON serialization
    });
};