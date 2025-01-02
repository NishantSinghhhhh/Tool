import React, { useEffect, useState } from "react";
import logo3 from "../assets/logo.svg";
import logo4 from "../assets/Ait.svg";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext";

interface UserScore {
  username: string;
  totalMarks: number;
  section1Marks: number;
  section2Marks: number;
  section3Marks: number;
}

interface BackendResponse {
  success: boolean;
  message: string;
  userInfo: any[];
  scores: UserScore[];
}

const Dashboard: React.FC = () => {
  const { username } = useAuth();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<BackendResponse | null>(null);

  useEffect(() => {
    const user = creds.find((cred) => cred.username === username);
    if (user) {
      setSchoolName(user.schoolName);
      console.log(user.schoolName);
    }
  }, [username]);

  const handleFetchDetails = async () => {
    if (!schoolName || schoolName.trim() === "") {
      alert("School name is not valid.");
      return;
    }

    console.log("Payload being sent to backend:", { text: schoolName });
    setIsFetching(true);

    try {
      const response = await fetch("http://localhost:7009/result/schoolName", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: schoolName }),
      });

      if (!response.ok) {
        throw new Error("Failed to send school name to backend");
      }

      const data: BackendResponse = await response.json();
      console.log("Response from backend:", data);
      setFetchedData(data);
    } catch (error) {
      console.error("Error sending school name to backend:", error);
      alert("Failed to fetch details.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src={logo3} alt="Logo" className="h-12 w-auto" />
            <img src={logo4} alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">
          Round 1 Detailed Results
        </h1>
      </div>

      <div className="text-black text-2xl font-bold flex justify-center items-center pb-10">
        {schoolName ? schoolName : "Loading school name..."}
      </div>

      <div className="text-center">
        <button
          onClick={handleFetchDetails}
          className={`bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 ${
            isFetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isFetching}
        >
          {isFetching ? "Fetching..." : "Fetch Details"}
        </button>
      </div>

      {fetchedData && (
        <div className="mt-10 max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-700">
            Fetched Results for {schoolName}
          </h2>
          <p className="text-gray-600 mb-6">{fetchedData.message}</p>

          <h3 className="text-lg font-semibold mb-2 text-gray-800">Scores:</h3>
          <table className="table-auto w-full text-left">
            <thead>
              <tr>
                <th className="px-4 text-black py-2">Username</th>
                <th className="px-4 text-black py-2">Total Marks</th>
                <th className="px-4 text-black py-2">Section 1</th>
                <th className="px-4 text-black py-2">Section 2</th>
                <th className="px-4 text-black py-2">Section 3</th>
              </tr>
            </thead>
            <tbody>
              {fetchedData.scores.map((score, index) => (
                <tr  key={index} className="border-t">
                  <td className="px-4 text-black py-2">{score.username}</td>
                  <td className="px-4 text-black py-2">{score.totalMarks}</td>
                  <td className="px-4 text-black py-2">{score.section1Marks}</td>
                  <td className="px-4 text-black py-2">{score.section2Marks}</td>
                  <td className="px-4 text-black py-2">{score.section3Marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
