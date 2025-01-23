
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs'; 
import path from 'path';

dotenv.config();
const mongo_url = process.env.MONGO_CONN;
const dbName = 'schools';

const creds = [
    { username: "NAVYUG41400172", schoolName: "Army Public School Ahmednagar", password: "apsnavyug891" },
    { username: "NAVYUG38000461", schoolName: "Army Public School Ahmedabad Cantt", password: "apsnavyug891" },
    { username: "NAVYUG18120183", schoolName: "Army Public School Akhnoor", password: "apsnavyug891" },
    { username: "NAVYUG30100160", schoolName: "Army Public School Alwar", password: "apsnavyug891" },
    { username: "NAVYUG14300668", schoolName: "Army Public School Amritsar", password: "apsnavyug891" },
    { username: "NAVYUG18113341", schoolName: "Army Public School Bd Bari", password: "apsnavyug891" },
    { username: "NAVYUG70012073", schoolName: "APS BARRACKPORE", password: "apsnavyug891" },
    { username: "NAVYUG15100471", schoolName: "Army Public School Bathinda", password: "apsnavyug891" },
    { username: "NAVYUG78102932", schoolName: "Army Public School Basistha", password: "apsnavyug891" },
    { username: "NAVYUG50008734", schoolName: "Army Public School Bolarum", password: "apsnavyug891" },
    { username: "NAVYUG28440163", schoolName: "Army Public School Babina Cantt", password: "apsnavyug891" },
    { username: "NAVYUG24800266", schoolName: "Army Public School Clement Town", password: "apsnavyug891" },
    { username: "NAVYUG60008955", schoolName: "Army Public School, Chennai", password: "apsnavyug891" },
    { username: "NAVYUG67001338", schoolName: "Army Public School Cannanore", password: "apsnavyug891" },
    { username: "NAVYUG24800165", schoolName: "Army Public School, Birpur", password: "apsnavyug891" },
    { username: "NAVYUG42240130", schoolName: "Army Public School Devlali", password: "apsnavyug891" },
    { username: "NAVYUG18210135", schoolName: "Army Public School Dhar Road", password: "apsnavyug891" },
    { username: "NAVYUG18000342", schoolName: "APS Jammu Cantt", password: "apsnavyug891" },
    { username: "NAVYUG18410480", schoolName: "Army Public School Janglot", password: "apsnavyug891" },
    { username: "NAVYUG34201039", schoolName: "Army Public School Jodhpur", password: "apsnavyug891" },
    { username: "NAVYUG56004244", schoolName: "Army Public School K Kamraj", password: "apsnavyug891" },
    { username: "NAVYUG18001050", schoolName: "Army Public School Kaluchak", password: "apsnavyug891" },
    { username: "NAVYUG20800462", schoolName: "Army Public School Kanpur", password: "apsnavyug891" },
    { username: "NAVYUG32400164", schoolName: "Army Public School Kota", password: "apsnavyug891" },
    { username: "NAVYUG22600245", schoolName: "Army Public School Lbs Marg", password: "apsnavyug891" },
    { username: "NAVYUG18110167", schoolName: "Army Public School Miran Sahib", password: "apsnavyug891" },
    { username: "NAVYUG25000140", schoolName: "Army Public School Meerut", password: "apsnavyug891" },
    { username: "NAVYUG45344153", schoolName: "Army Public School Mhow", password: "apsnavyug891" },
    { username: "NAVYUG40008979", schoolName: "Army Public School Mumbai", password: "apsnavyug891" },
    { username: "NAVYUG18122148", schoolName: "Army Public School Nagrota", password: "apsnavyug891" },
    { username: "NAVYUG78102782", schoolName: "Army Public School Narangi", password: "apsnavyug891" },
    { username: "NAVYUG21100137", schoolName: "Army Public School New Prayagraj Cantt", password: "apsnavyug891" },
    { username: "NAVYUG20130347", schoolName: "Army Public School Noida", password: "apsnavyug891" },
    { username: "NAVYUG24765675", schoolName: "Army Public School No 1 Roorkee", password: "apsnavyug891" },
    { username: "NAVYUG21100469", schoolName: "Army Public School Old Cantt Prayagraj", password: "apsnavyug891" },
    { username: "NAVYUG79300776", schoolName: "Army Public School Happy Valley", password: "apsnavyug891" },
    { username: "NAVYUG14502484", schoolName: "Army Public School Madhopur", password: "apsnavyug891" },
    { username: "NAVYUG47000131", schoolName: "Army Public School Sagar", password: "apsnavyug891" },
    { username: "NAVYUG33500136", schoolName: "Army Public School Sri Ganganagar", password: "apsnavyug891" },
    { username: "NAVYUG22600246", schoolName: "Army Public School Sp Marg", password: "apsnavyug891" },
    { username: "NAVYUG11001033", schoolName: "Army Public School, Dhaula Kuan", password: "apsnavyug891" },
    { username: "NAVYUG41400172", schoolName: "Army Public School Ahmednagar", password: "apsnavyug891" },
    { username: "NAVYUG41100178", schoolName: "Army Public School Pune", password: "apsnavyug891" },
    { username: "NAVYUG24920574", schoolName: "Army Public School, Raiwala", password: "apsnavyug891" },
    { username: "NAVYUG18001051", schoolName: "Army Public School Ratnuchak", password: "apsnavyug891" },
    { username: "NAVYUG26364549", schoolName: "Army Public School Ranikhet", password: "apsnavyug891" },
    { username: "NAVYUG50005643", schoolName: "Army Public School Rk Puram Secunderabad", password: "apsnavyug891" },
    { username: "NAVYUG34201039", schoolName: "Army Public School Jodhpur", password: "apsnavyug891" },
    { username: "NAVYUG11001070", schoolName: "Army Public School Shankar Vihar", password: "apsnavyug891" },
    { username: "NAVYUG79011581", schoolName: "Army Public School Tenga Valley AP", password: "apsnavyug891" },
    { username: "NAVYUG17321054", schoolName: "Army Public School Dagshai", password: "apsnavyug891" },
];

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

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Now join it with 'results.json'
const filePath = path.join(__dirname, 'results.json');
export const verification = async (req, res) => {
  console.log("Request received at SchoolRanking endpoint");

  const mongo_url = process.env.MONGO_CONN; // Ensure MongoDB URL is set in environment variables
  const dbName = "schools"; // Replace with your database name

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

    const results = [];
    let totalUsersCount = 0; // Variable to store total count of users

    for (const schoolName of schools) {
      // Fetch users for each school
      const users = await usersCollection.find({ schoolName }).toArray();

      // Exclude users with "timeLeft" equal to 2400
      const filteredUsers = users.filter((user) => user.timeLeft !== 2400);

      // Sort users alphabetically by the `student` property
      const sortedUsers = filteredUsers.sort((a, b) =>
        a.student.localeCompare(b.student)
      );

      // Increment totalUsersCount with the number of users for this school
      totalUsersCount += sortedUsers.length;

      // Extract usernames from creds array for this school
      const schoolCreds = creds.filter((cred) => cred.schoolName === schoolName);

      let allDigitsString = ""; // Reset allDigitsString for each school

      if (schoolCreds.length > 0) {
        console.log(`Usernames from creds for ${schoolName}:`);
        schoolCreds.forEach(({ username }) => {
          console.log(`- ${username}`);

          // Extract numeric part from the username and add all digits to the allDigitsString
          const number = username.match(/\d+/)?.[0]; // Extract numeric part
          if (number) {
            // Concatenate digits to the string (not unique)
            allDigitsString += number;
          }
        });
      } else {
        console.log(`No credentials found for ${schoolName}`);
      }

      // Log sorted users for the school
      if (sortedUsers.length > 0) {
        console.log(`Sorted users from ${schoolName}:`);
        sortedUsers.forEach((user, index) => {
          console.log(`- ${user.student} (${user.username})`);

          // Combine allDigitsString with the unique number (index + 1)
          const uniqueNumber = `${allDigitsString}${index + 1}`; // Concatenate the allDigitsString and unique number
          console.log(`Assigned unique number for ${user.student}: ${uniqueNumber}`);

          // Determine category based on the setid
          const category = user.setid && user.setid.includes("67") ? "Category 1" : "Category 2";

          // Add the user details to the results array
          const userDetails = {
            holderName: user.student, // Name of the student
            certificateId: uniqueNumber, // Unique number assigned
            school: schoolName, // School name
            issueDate: "23 January 2025", // Fixed issue date
            status: "verified", // Status is "verified"
            passkey: "", // Passkey is kept empty
            category: category, // Category based on setid
          };

          // Push user details to the results array
          results.push(userDetails);
        });
      } else {
        console.log(`No users found for ${schoolName}`);
      }
    }

    // Save the results array as a JSON file
    try {
      const filePath = path.join(__dirname, "results.json");
      fs.writeFileSync(filePath, JSON.stringify({ success: true, data: results }, null, 2), "utf-8");
      console.log("File saved successfully");
    } catch (error) {
      console.error("Error writing file:", error);
    }

    // Return the results array with the generated data, along with the user count
    return res.status(200).json({
      success: true,
      message: "Users fetched, sorted, and unique numbers assigned successfully",
      data: results, // Return the array of user details
      totalUsersCount: totalUsersCount, // Include the total user count
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    return res.status(500).json({
      success: false,
      message: "Error connecting to MongoDB",
    });
  } finally {
    await client.close(); // Ensure the client is closed after the operation
  }
};
