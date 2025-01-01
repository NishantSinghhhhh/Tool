import { answer } from "../data/db.js";
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'test';


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
export const submitText = async (req, res) => {
    console.log("Request received at submitText endpoint");

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

        const schoolsArray = [];
        const marksArray = [];
        const usersArray = [];
        const unprocessedUsers = [];
        let totalStudentsChecked = 0;

        for (let i = 0; i < schools.length; i++) {
            const querySchool = schools[i];
            const normalizeSchoolName = (name) =>
                name ? name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() : "";

            const normalizedQuerySchool = normalizeSchoolName(querySchool);
            const userMap = new Map();
            const schoolMarks = [];

            console.log(`Processing school: ${querySchool}`);

            const users = await usersCollection.find({}).toArray();

            const matchingUsers = users.filter(user => 
                user.schoolName && normalizeSchoolName(user.schoolName) === normalizedQuerySchool
            );

            matchingUsers.forEach((user) => {
                userMap.set(user.username, user.setid);
            });

            for (const [username, setId] of userMap) {
                const userAnswers = await answersCollection.findOne({ username });

                if (!userAnswers || !userAnswers.answers) {
                    // console.log(`No answers found for user: ${username}. Marks: 0`);
                    schoolMarks.push({ username, marks: 0 });
                    unprocessedUsers.push(username);
                    continue;
                }

                const correctSet = answer.find((a) => a.setId === setId);
                if (!correctSet) {
                    // console.log(`No correct answers found for setId: ${setId}. Skipping.`);
                    schoolMarks.push({ username, marks: 0 });
                    unprocessedUsers.push(username);
                    continue;
                }

                totalStudentsChecked++;

                const correctAnswers = correctSet.answers;
                let marks = 0;

                for (const [question, correctAnswer] of Object.entries(correctAnswers)) {
                    const userAnswer = userAnswers.answers[question];

                    if (!userAnswer) {
                        // No answer, no change to marks
                    } else if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
                        marks += 4;
                    } else {
                        marks -= 1;
                    }
                }

                schoolMarks.push({ username, marks });
            }

            // Push data into separate arrays
            schoolsArray.push(querySchool);
            marksArray.push(schoolMarks);
            usersArray.push(matchingUsers);

            // console.log("Final results for the school:", {
            //     school: querySchool,
            //     marks: schoolMarks,
            //     users: matchingUsers,
            // });
        }

        res.status(200).json({
            success: true,
            message: "Processing complete for all schools",
            totalStudentsChecked,
            schools: schoolsArray,
            marks: marksArray,
            users: usersArray,
            
            unprocessedUsers,
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
