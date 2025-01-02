import React, { useEffect, useState } from "react";
import logo3 from "../assets/logo.svg";
import logo4 from "../assets/Ait.svg";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext";
import PDFDownload from "./PdfDownload.tsx";

interface UserScore {
  username: string;
  totalMarks: number;
  section1Marks: number;
  section2Marks: number;
  section3Marks: number;
  category: string;
  studentName: string
}

interface UserInfo {
  username: string;
  student: string;
  setid: string;
}

interface BackendResponse {
  success: boolean;
  message: string;
  userInfo: UserInfo[];
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

      // Add student name and category to scores
      const updatedScores = data.scores.map((score) => {
        const matchingUser = data.userInfo.find((user) => user.username === score.username);
        const category = matchingUser?.setid.startsWith("67") ? "Category 1" : "Category 2";
        return {
          ...score,
          studentName: matchingUser?.student || "Unknown",
          category,
        };
      });

      setFetchedData({ ...data, scores: updatedScores });
    } catch (error) {
      console.error("Error sending school name to backend:", error);
      alert("Failed to fetch details.");
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <div className="h-[120vh] bg-gray-50">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-20">
            <img src={logo3} alt="Logo" className="h-12 w-auto" />
            <img src={logo4} alt="AWES Logo" className="h-12" />
          </div>
        </div>
      </nav>

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Round 1 Detailed Results</h1>
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

        <div>
          {/* <PDFDownload/> */}
        </div>
      </div>

      {fetchedData && (
  <div className="mt-10 max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-500 to-blue-600">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Student Name
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Total Marks
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Section 1
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Section 2
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Section 3
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Sort and display category 1 */}
          {fetchedData.scores
            .filter((score) => score.category === "Category 1")
            .sort((a, b) => b.totalMarks - a.totalMarks) // Sort descending by totalMarks
            .map((score, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{score.username}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.studentName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.totalMarks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section1Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section2Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section3Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.category}</span>
                </td>
              </tr>
            ))}

          {/* Sort and display category 2 */}
          {fetchedData.scores
            .filter((score) => score.category === "Category 2")
            .sort((a, b) => b.totalMarks - a.totalMarks) // Sort descending by totalMarks
            .map((score, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{score.username}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.studentName}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.totalMarks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section1Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section2Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.section3Marks}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{score.category}</span>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  </div>
)}

    </div>
  );
};

export default Dashboard;
