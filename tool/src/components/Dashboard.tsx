import React, { useEffect, useState } from "react";
import logo3 from "../assets/logo.svg";
import logo4 from "../assets/Ait.svg";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
// import PDFDownload from "./PdfDownload.tsx";
import {schoolFrequencyData} from "../data/schoolFrequency.ts"

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

  const totalMarks = schoolFrequencyData.totalMarks;
  const category1Section1Marks = schoolFrequencyData.category1Section1Marks;
  const category1Section2Marks = schoolFrequencyData.category1Section2Marks;
  const category1Section3Marks = schoolFrequencyData.category1Section3Marks;
  const category2Section1Marks = schoolFrequencyData.category2Section1Marks;
  const category2Section2Marks = schoolFrequencyData.category2Section2Marks;
  const category2Section3Marks = schoolFrequencyData.category2Section3Marks;

  const renderTable = (
    category: string,
    section: string,
    frequencyData: Record<string, number>,
    sectionKey: "section1Marks" | "section2Marks" | "section3Marks"
  ) => {
    return (
      <div className="table-container mt-10 max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">{`${category} - ${section}`}</h2>
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
                  {`${section} Marks`}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  {`${section} Percentile`}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fetchedData &&
                fetchedData.scores
                  .filter((score) => score.category === category) // Filter by category
                  .sort((a, b) => b[sectionKey] - a[sectionKey]) // Sort descending by section marks
                  .map((score, index) => {
                    const percentile = calculatePercentile(frequencyData, score[sectionKey]);

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{score.username}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{score.studentName}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{score[sectionKey]}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{percentile.toFixed(2)}%</span>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  

  const calculatePercentile = (frequencyData: Record<string, number>, score: number): number => {
    const marksArray = Object.entries(frequencyData)
      .map(([key, value]) => ({
        marks: parseInt(key, 10),
        frequency: value,
      }))
      .sort((a, b) => a.marks - b.marks); // Sort in ascending order

    const totalStudents = marksArray.reduce((acc, curr) => acc + curr.frequency, 0);
    let cumulativeFreq = 0;

    const percentile = marksArray.reduce((acc, curr) => {
      cumulativeFreq += curr.frequency;
      if (curr.marks === score) {
        acc = ((cumulativeFreq - curr.frequency / 2) / totalStudents) * 100;
      }
      return acc;
    }, 0);

    return percentile;
  };
  
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
  const generatePDF = () => {
    const pdf = new jsPDF("p", "mm", "a4");

    // Set title
    pdf.setFontSize(18);
    pdf.text("Round 1 Detailed Results", 14, 15);

    // Table Columns
    const columns = [
      { header: "Username", dataKey: "username" },
      { header: "Student Name", dataKey: "studentName" },
      { header: "Section 1 Marks", dataKey: "section1Marks" },
      { header: "Section 2 Marks", dataKey: "section2Marks" },
      { header: "Section 3 Marks", dataKey: "section3Marks" },
      { header: "Total Marks", dataKey: "totalMarks" },
      { header: "Category", dataKey: "category" },
    ];

    // Table Rows
    const rows = fetchedData?.scores.map((score) => ({
      username: score.username,
      studentName: score.studentName,
      section1Marks: score.section1Marks,
      section2Marks: score.section2Marks,
      section3Marks: score.section3Marks,
      totalMarks: score.totalMarks,
      category: score.category,
    }));

    // Add table to PDF
    pdf.autoTable({
      columns,
      body: rows || [], // Use an empty array if no data
      startY: 25, // Start after title
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 14, right: 14 },
    });

    // Save PDF
    pdf.save("Round1_Detailed_Results.pdf");
  };

  return (
    <div className="h-[300vh] bg-gray-50">
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
      <button
        onClick={generatePDF}
        className="bg-purple-500 text-white px-6 py-2 rounded shadow hover:bg-red-600 mb-4"
      >
        Download PDF
      </button>

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
              Percentile
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
              Category
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Render Category 1 */}
          {fetchedData.scores
            .filter((score) => score.category === "Category 1") // Filter Category 1
            .sort((a, b) => b.totalMarks - a.totalMarks) // Sort descending by totalMarks
            .map((score, index) => {
              // Ensure totalMarks data is available
              const marksArray = Object.entries(totalMarks as Record<string, number>)
                .map(([key, value]) => ({
                  marks: parseInt(key, 10),
                  frequency: value,
                }))
                .sort((a, b) => a.marks - b.marks); // Sort marks in ascending order

              // Calculate cumulative frequency and total students
              const totalStudents = marksArray.reduce((acc, curr) => acc + curr.frequency, 0);
              let cumulativeFreq = 0;

              // Calculate percentile
              const percentile = marksArray.reduce((acc, curr) => {
                cumulativeFreq += curr.frequency;
                if (curr.marks === score.totalMarks) {
                  acc = ((cumulativeFreq - curr.frequency / 2) / totalStudents) * 100;
                }
                return acc;
              }, 0);

              return (
                <tr key={`cat1-${index}`} className="hover:bg-gray-50 transition-colors duration-200">
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
                    <span className="text-sm font-medium text-gray-900">{percentile.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{score.category}</span>
                  </td>
                </tr>
              );
            })}

          {/* Render Category 2 */}
          {fetchedData.scores
            .filter((score) => score.category === "Category 2") // Filter Category 2
            .sort((a, b) => b.totalMarks - a.totalMarks) // Sort descending by totalMarks
            .map((score, index) => {
              // Ensure totalMarks data is available
              const marksArray = Object.entries(totalMarks as Record<string, number>)
                .map(([key, value]) => ({
                  marks: parseInt(key, 10),
                  frequency: value,
                }))
                .sort((a, b) => a.marks - b.marks); // Sort marks in ascending order

              // Calculate cumulative frequency and total students
              const totalStudents = marksArray.reduce((acc, curr) => acc + curr.frequency, 0);
              let cumulativeFreq = 0;

              // Calculate percentile
              const percentile = marksArray.reduce((acc, curr) => {
                cumulativeFreq += curr.frequency;
                if (curr.marks === score.totalMarks) {
                  acc = ((cumulativeFreq - curr.frequency / 2) / totalStudents) * 100;
                }
                return acc;
              }, 0);

              return (
                <tr key={`cat2-${index}`} className="hover:bg-gray-50 transition-colors duration-200">
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
                    <span className="text-sm font-medium text-gray-900">{percentile.toFixed(2)}%</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{score.category}</span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
)}

<div className="h-[300vh] bg-gray-50">
      {/* Tables for Category 1 */}
      {renderTable("Category 1", "Section 1", category1Section1Marks, "section1Marks")}
      {renderTable("Category 1", "Section 2", category1Section2Marks, "section2Marks")}
      {renderTable("Category 1", "Section 3", category1Section3Marks, "section3Marks")}

      {/* Tables for Category 2 */}
      {renderTable("Category 2", "Section 1", category2Section1Marks, "section1Marks")}
      {renderTable("Category 2", "Section 2", category2Section2Marks, "section2Marks")}
      {renderTable("Category 2", "Section 3", category2Section3Marks, "section3Marks")}
    </div>

    </div>
  );
};

export default Dashboard;
