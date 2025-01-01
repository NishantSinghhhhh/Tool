import { answer } from "../data/db.js";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'test';

const schools = [
    "APS BARRACKPORE",
    "APS Jammu Cantt",
    // "APS JODHPUR",
    // "APS Mhow",
    // "APS Miran Sahib",
    // "ARMY PUBLIC SCHOOL HAPPY VALLEY",
    // "ARMY PUBLIC SCHOOL KALUCHAK",
    // "ARMY PUBLIC SCHOOL NAGROTA",
    // "ARMY PUBLIC SCHOOL NEW PRAYAGRAJ CANTT",
    // "ARMY PUBLIC SCHOOL OLD CANTT PRAYAGRAJ",
    // "ARMY PUBLIC SCHOOL R K PURAM",
    // "Army Public School Ahmedabad",
    // "Army Public School Ahmednagar",
    // "Army Public School Alwar",
    // "Army Public School Amritsar",
    // "Army Public School, Babina",
    // "Army Public School Basistha",
    // "Army Public School Bathinda",
    // "Army Public School BD Bari",
    // "Army Public School Birpur",
    // "Army Public School Bolarum",
    // "Army Public School Cannanore",
    // "Army Public School, Chennai",
    // "Army Public School, Dagshahi",
    // "Army Public School, Devlali",
    // "Army Public School Dhar Road",
    // "Army Public School, Dhaula Kuan",
    // "Army Public School Gurgaon",
    // "Army Public School Janglot",
    // "Army Public School, K Kamaraj",
    // "Army Public School Kanpur",
    // "Army Public School Kota",
    // "Army Public School, Lbs Marg",
    // "Army Public School, Madhopur",
    // "Army Public School Meerut",
    // "Army Public School Meerut Cantt",
    // "Army Public School Mumbai",
    // "Army Public School Narangi",
    // "Army Public School Noida",
    // "Army Public School, Pune",
    // "Army Public School Pune Cantt",
    // "Army Public School, Raiwala",
    // "Army Public School Ranikhet",
    // "Army Public School Ratnuchak",
    // "Army Public School Shankar Vihar",
    // "Army Public School Sp Marg",
    // "Army Public School Sri Ganganagar",
    // "Army Public School Tenga Valley",
];

export const SchoolRanking = async (req, res) => {
    console.log("Request received at SchoolRanking endpoint");

    if (!mongo_url) {
        console.error("MongoDB connection string is missing");
        return res.status(500).json({
            success: false,
            message: "MongoDB configuration error",
        });
    }

    const startProcess = true; // Sending request as 1 implies a boolean true for processing

    if (!startProcess) {
        return res.status(400).json({
            success: false,
            message: "Invalid request: startProcess must be true",
        });
    }

    const client = new MongoClient(mongo_url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection("users");
        const answersCollection = db.collection("answers");

        const results = [];

        for (let i = 0; i < schools.length; i++) {
            const querySchool = schools[i];
            const normalizeSchoolName = (name) =>
                name ? name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() : "";

            const normalizedQuerySchool = normalizeSchoolName(querySchool);

            console.log(`Processing school: ${querySchool}`);

            const users = await usersCollection.find({}).toArray();

            const matchingUsers = users.filter(user => 
                user.schoolName && normalizeSchoolName(user.schoolName) === normalizedQuerySchool
            );

            let totalMarks = 0;
            let section1Marks = 0;
            let section2Marks = 0;
            let section3Marks = 0;

            for (const user of matchingUsers) {
                const userAnswers = await answersCollection.findOne({ username: user.username });

                if (!userAnswers || !userAnswers.answers) {
                    continue;
                }

                const correctSet = answer.find((a) => a.setId === user.setid);
                if (!correctSet) {
                    continue;
                }

                const correctAnswers = correctSet.answers;
                let userTotalMarks = 0;
                let userSection1Marks = 0;
                let userSection2Marks = 0;
                let userSection3Marks = 0;

                for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
                    const questionNumber = parseInt(question, 10);
                    const userAnswer = userAnswers.answers[question];

                    if (!userAnswer || userAnswer.trim() === "") {
                        continue;
                    }

                    const isCorrect = userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                    const marks = isCorrect ? 4 : -1;

                    userTotalMarks += marks;

                    if (questionNumber >= 1 && questionNumber <= 10) {
                        userSection1Marks += marks;
                    } else if (questionNumber >= 11 && questionNumber <= 20) {
                        userSection2Marks += marks;
                    } else if (questionNumber >= 21 && questionNumber <= 25) {
                        userSection3Marks += marks;
                    }
                }

                totalMarks += userTotalMarks;
                section1Marks += userSection1Marks;
                section2Marks += userSection2Marks;
                section3Marks += userSection3Marks;
            }

            const totalStudents = matchingUsers.length;

            results.push({
                school: querySchool,
                averageMarks: totalStudents > 0 ? totalMarks / totalStudents : 0,
                section1Average: totalStudents > 0 ? section1Marks / totalStudents : 0,
                section2Average: totalStudents > 0 ? section2Marks / totalStudents : 0,
                section3Average: totalStudents > 0 ? section3Marks / totalStudents : 0,
            });
        }

        // Calculate overall and section-wise ranks
        results.sort((a, b) => b.averageMarks - a.averageMarks);
        results.forEach((school, index) => {
            school.rank = index + 1;
        });

        results.sort((a, b) => b.section1Average - a.section1Average);
        results.forEach((school, index) => {
            school.section1Rank = index + 1;
        });

        results.sort((a, b) => b.section2Average - a.section2Average);
        results.forEach((school, index) => {
            school.section2Rank = index + 1;
        });

        results.sort((a, b) => b.section3Average - a.section3Average);
        results.forEach((school, index) => {
            school.section3Rank = index + 1;
        });

        res.status(200).json({
            success: true,
            message: "Processing complete for all schools",
            results,
        });
    } catch (err) {
        console.error("Error processing request:", err);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    } finally {
        await client.close();
    }
};
