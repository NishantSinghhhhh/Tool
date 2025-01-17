import { answer } from "../data/db.js";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'schools';

const schools = [
    "APS BARRACKPORE",
    "APS Jammu Cantt",
    "APS JODHPUR",
    "APS Mhow",
    "APS Miran Sahib",
    "ARMY PUBLIC SCHOOL HAPPY VALLEY",
    "ARMY PUBLIC SCHOOL KALUCHAK",
    "ARMY PUBLIC SCHOOL NAGROTA",
    "ARMY PUBLIC SCHOOL NEW PRAYAGRAJ CANTT",
    "ARMY PUBLIC SCHOOL OLD CANTT PRAYAGRAJ",
    "ARMY PUBLIC SCHOOL R K PURAM",
    "Army Public School Ahmedabad",
    "Army Public School Ahmednagar",
    "Army Public School Alwar",
    "Army Public School Amritsar",
    "Army Public School, Babina",
    "Army Public School Basistha",
    "Army Public School Bathinda",
    "Army Public School BD Bari",
    "Army Public School Birpur",
    "Army Public School Bolarum",
    "Army Public School Cannanore",
    "Army Public School, Chennai",
    "Army Public School, Dagshahi",
    "Army Public School, Devlali",
    "Army Public School Dhar Road",
    "Army Public School, Dhaula Kuan",
    "Army Public School Gurgaon",
    "Army Public School Janglot",
    "Army Public School, K Kamaraj",
    "Army Public School Kanpur",
    "Army Public School Kota",
    "Army Public School, Lbs Marg",
    "Army Public School, Madhopur",
    "Army Public School Meerut",
    "Army Public School Meerut Cantt",
    "Army Public School Mumbai",
    "Army Public School Narangi",
    "Army Public School Noida",
    "Army Public School, Pune",
    "Army Public School Pune Cantt",
    "Army Public School, Raiwala",
    "Army Public School Ranikhet",
    "Army Public School Ratnuchak",
    "Army Public School Shankar Vihar",
    "Army Public School Sp Marg",
    "Army Public School Sri Ganganagar",
    "Army Public School Tenga Valley",
];


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

            let category1Marks = 0;
            let category2Marks = 0;

            let category1Section1Marks = 0;
            let category1Section2Marks = 0;
            let category1Section3Marks = 0;

            let category2Section1Marks = 0;
            let category2Section2Marks = 0;
            let category2Section3Marks = 0;

            let category1Count = 0;
            let category2Count = 0;

            const totalStudents = matchingUsers.length;

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
                        // console.log(`Skipped question ${question} for user ${user.username}`);
                        continue;
                    }

                    // console.log(`Checking question ${question} for user ${user.username}`);

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

                // console.log(`User: ${user.username}, Total Marks: ${userTotalMarks}, Section 1: ${userSection1Marks}, Section 2: ${userSection2Marks}, Section 3: ${userSection3Marks}`);

                totalMarks += userTotalMarks;
                section1Marks += userSection1Marks;
                section2Marks += userSection2Marks;
                section3Marks += userSection3Marks;

                if (user.setid.startsWith("67")) {
                    category1Marks += userTotalMarks;
                    category1Section1Marks += userSection1Marks;
                    category1Section2Marks += userSection2Marks;
                    category1Section3Marks += userSection3Marks;
                    category1Count++;
                } else if (user.setid.startsWith("89")) {
                    category2Marks += userTotalMarks;
                    category2Section1Marks += userSection1Marks;
                    category2Section2Marks += userSection2Marks;
                    category2Section3Marks += userSection3Marks;
                    category2Count++;
                }
            }

            // console.log(`School: ${querySchool}, Total Students: ${totalStudents}, Total Marks: ${totalMarks}, Section 1 Marks: ${section1Marks}, Section 2 Marks: ${section2Marks}, Section 3 Marks: ${section3Marks}`);
            // console.log(`Divisors - Total Students: ${totalStudents}, Category 1 Count: ${category1Count}, Category 2 Count: ${category2Count}`);

            results.push({
                school: querySchool,
                averageMarks: totalStudents > 0 ? totalMarks / totalStudents : 0,
                section1Average: totalStudents > 0 ? section1Marks / totalStudents : 0,
                section2Average: totalStudents > 0 ? section2Marks / totalStudents : 0,
                section3Average: totalStudents > 0 ? section3Marks / totalStudents : 0,
                category1Average: category1Count > 0 ? category1Marks / category1Count : 0,
                category1Section1Average: category1Count > 0 ? category1Section1Marks / category1Count : 0,
                category1Section2Average: category1Count > 0 ? category1Section2Marks / category1Count : 0,
                category1Section3Average: category1Count > 0 ? category1Section3Marks / category1Count : 0,
                category2Average: category2Count > 0 ? category2Marks / category2Count : 0,
                category2Section1Average: category2Count > 0 ? category2Section1Marks / category2Count : 0,
                category2Section2Average: category2Count > 0 ? category2Section2Marks / category2Count : 0,
                category2Section3Average: category2Count > 0 ? category2Section3Marks / category2Count : 0,
            });
        }

        // Calculate overall and section-wise ranks
        results.sort((a, b) => b.averageMarks - a.averageMarks);
        results.forEach((school, index) => {
            school.rank = index + 1;
        });
        results.sort((a, b) => b.category1Average - a.category1Average);
        results.forEach((school, index) => {
            school.category1Rank = index + 1;
        });

        results.sort((a, b) => b.category2Average - a.category2Average);
        results.forEach((school, index) => {
            school.category2Rank = index + 1;
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

        results.sort((a, b) => b.category1Section1Average - a.category1Section1Average);
        results.forEach((school, index) => {
            school.category1Section1Rank = index + 1;
        });

        results.sort((a, b) => b.category1Section2Average - a.category1Section2Average);
        results.forEach((school, index) => {
            school.category1Section2Rank = index + 1;
        });

        results.sort((a, b) => b.category1Section3Average - a.category1Section3Average);
        results.forEach((school, index) => {
            school.category1Section3Rank = index + 1;
        });

        results.sort((a, b) => b.category2Section1Average - a.category2Section1Average);
        results.forEach((school, index) => {
            school.category2Section1Rank = index + 1;
        });

        results.sort((a, b) => b.category2Section2Average - a.category2Section2Average);
        results.forEach((school, index) => {
            school.category2Section2Rank = index + 1;
        });

        results.sort((a, b) => b.category2Section3Average - a.category2Section3Average);
        results.forEach((school, index) => {
            school.category2Section3Rank = index + 1;
        });


        console.log("Final Results:", results);

        // Store results as a .ts file in the frontend folder
        const filePath = path.resolve(__dirname, '../../tool/src/data/schoolRanking.ts');
        const fileContent = `export const schoolRankingData = ${JSON.stringify(results, null, 2)};`;

        // Ensure the directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write the file
        fs.writeFileSync(filePath, fileContent, 'utf8');
        // console.log(`File saved at ${filePath}`);

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

export const SchoolFrequecny = async (req, res) => {
    console.log("Request received at SchoolFrequency endpoint");

    if (!mongo_url) {
        console.error("MongoDB connection string is missing");
        return res.status(500).json({
            success: false,
            message: "MongoDB configuration error",
        });
    }

    const client = new MongoClient(mongo_url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection("users");
        const answersCollection = db.collection("answers");

        const users = await usersCollection.find({}).toArray();
        let cumulativeFrequencyData = {
            totalMarks: {},
            category1Marks: {},
            category2Marks: {},
            category1Section1Marks: {},
            category1Section2Marks: {},
            category1Section3Marks: {},
            category2Section1Marks: {},
            category2Section2Marks: {},
            category2Section3Marks: {},
        };

        const incrementFrequency = (obj, value) => {
            obj[value] = (obj[value] || 0) + 1;
        };

        for (const user of users) {
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

            incrementFrequency(cumulativeFrequencyData.totalMarks, userTotalMarks);

            if (user.setid.startsWith("67")) {
                incrementFrequency(cumulativeFrequencyData.category1Marks, userTotalMarks);
                incrementFrequency(cumulativeFrequencyData.category1Section1Marks, userSection1Marks);
                incrementFrequency(cumulativeFrequencyData.category1Section2Marks, userSection2Marks);
                incrementFrequency(cumulativeFrequencyData.category1Section3Marks, userSection3Marks);
            } else if (user.setid.startsWith("89")) {
                incrementFrequency(cumulativeFrequencyData.category2Marks, userTotalMarks);
                incrementFrequency(cumulativeFrequencyData.category2Section1Marks, userSection1Marks);
                incrementFrequency(cumulativeFrequencyData.category2Section2Marks, userSection2Marks);
                incrementFrequency(cumulativeFrequencyData.category2Section3Marks, userSection3Marks);
            }
        }

        // Store results as a .ts file in the frontend folder
        const filePath = path.resolve(__dirname, '../../tool/src/data/schoolFrequency.ts');
        const fileContent = `export const schoolFrequencyData = ${JSON.stringify(cumulativeFrequencyData, null, 2)};`;

        // Ensure the directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write the file
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`File saved at ${filePath}`);

        res.status(200).json({
            success: true,
            message: "Cumulative frequency data processing complete",
            cumulativeFrequencyData,
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

export const AllSchool = async (req, res) => {
    console.log("Request received at AllSchool endpoint");

    if (!mongo_url) {
        console.error("MongoDB connection string is missing");
        return res.status(500).json({
            success: false,
            message: "MongoDB configuration error",
        });
    }

    const client = new MongoClient(mongo_url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const usersCollection = db.collection("users");
        const answersCollection = db.collection("answers");

        const users = await usersCollection.find({}).toArray();

        let totalMarks = 0, section1Marks = 0, section2Marks = 0, section3Marks = 0;
        let category1Marks = 0, category2Marks = 0;
        let category1Section1Marks = 0, category1Section2Marks = 0, category1Section3Marks = 0;
        let category2Section1Marks = 0, category2Section2Marks = 0, category2Section3Marks = 0;

        let totalUsers = 0, category1Count = 0, category2Count = 0;

        for (const user of users) {
            const userAnswers = await answersCollection.findOne({ username: user.username });

            if (!userAnswers || !userAnswers.answers) continue;

            const correctSet = answer.find((a) => a.setId === user.setid);
            if (!correctSet) continue;

            const correctAnswers = correctSet.answers;
            let userTotalMarks = 0, userSection1Marks = 0, userSection2Marks = 0, userSection3Marks = 0;

            for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
                const questionNumber = parseInt(question, 10);
                const userAnswer = userAnswers.answers[question];

                if (!userAnswer || userAnswer.trim() === "") continue;

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
            totalUsers++;

            if (user.setid.startsWith("67")) {
                category1Marks += userTotalMarks;
                category1Section1Marks += userSection1Marks;
                category1Section2Marks += userSection2Marks;
                category1Section3Marks += userSection3Marks;
                category1Count++;
            } else if (user.setid.startsWith("89")) {
                category2Marks += userTotalMarks;
                category2Section1Marks += userSection1Marks;
                category2Section2Marks += userSection2Marks;
                category2Section3Marks += userSection3Marks;
                category2Count++;
            }
        }

        const averages = {
            totalAverage: totalUsers > 0 ? totalMarks / totalUsers : 0,
            section1Average: totalUsers > 0 ? section1Marks / totalUsers : 0,
            section2Average: totalUsers > 0 ? section2Marks / totalUsers : 0,
            section3Average: totalUsers > 0 ? section3Marks / totalUsers : 0,
            category1Average: category1Count > 0 ? category1Marks / category1Count : 0,
            category1Section1Average: category1Count > 0 ? category1Section1Marks / category1Count : 0,
            category1Section2Average: category1Count > 0 ? category1Section2Marks / category1Count : 0,
            category1Section3Average: category1Count > 0 ? category1Section3Marks / category1Count : 0,
            category2Average: category2Count > 0 ? category2Marks / category2Count : 0,
            category2Section1Average: category2Count > 0 ? category2Section1Marks / category2Count : 0,
            category2Section2Average: category2Count > 0 ? category2Section2Marks / category2Count : 0,
            category2Section3Average: category2Count > 0 ? category2Section3Marks / category2Count : 0,
        };

        res.status(200).json({
            success: true,
            message: "Averages calculated successfully",
            averages,
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
