import React, { useEffect, useState } from 'react';
import Header from './Dashboard/Header';
import { useAuth } from '../context/AuthContext';
import { schoolRankingData } from "../data/schoolRanking.ts";
import { creds } from "../data/creds.ts";
import { PDFDocument, rgb } from 'pdf-lib';
import pdfTemplate from '../assets/Round 1 participants.pdf';
import cursive from "../assets/Italianno-Regular.ttf"
import fontkit from '@pdf-lib/fontkit';
import JSZip from "jszip";
import { saveAs } from "file-saver";

interface UserScore {
  username: string;
  studentName: string;
  category: string;
  totalMarks: number;
  section1Marks: number;
  section2Marks: number;
  section3Marks: number;
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

interface SchoolRankingData {
  school: string;
  averageMarks: number;
  section1Average: number;
  section2Average: number;
  section3Average: number;
  rank: number;
}

const ECertificate = () => {
  const { username } = useAuth();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<BackendResponse | null>(null);
  const [schoolRanking, setSchoolRanking] = useState<SchoolRankingData | null>(null);

  useEffect(() => {
    if (!username) return;

    const user = creds.find((cred) => cred.username === username);
    if (user) {
      setSchoolName(user.schoolName);
      const matchingSchool = schoolRankingData.find(
        (school) => school.school === user.schoolName
      );
      if (matchingSchool) setSchoolRanking(matchingSchool);
    }
  }, [username]);

const numbersInUsername = username?.match(/\d+/g)?.join("") || "No numbers found";
console.log("Numbers in UserName: ", numbersInUsername);

  const handleFetchDetails = async () => {
    if (!schoolName || schoolName.trim() === "") {
      alert("School name is not valid.");
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch("http://localhost:7009/result/schoolName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: schoolName }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: BackendResponse = await response.json();
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
      alert("Failed to fetch details.");
    } finally {
      setIsFetching(false);
    }
  };

  const generateCertificate = async (studentName: string, uniqueNumber: string) => {
    const templateResponse = await fetch(pdfTemplate);
    const fontResponse = await fetch(cursive);

    const templateBuffer = await templateResponse.arrayBuffer();
    const fontBuffer = await fontResponse.arrayBuffer();

    const pdfDoc = await PDFDocument.load(templateBuffer);
    pdfDoc.registerFontkit(fontkit);
    const customFont = await pdfDoc.embedFont(fontBuffer);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    const fontSize = 36;
    const textWidth = customFont.widthOfTextAtSize(studentName, fontSize);
    const x = (width - textWidth) / 2;
    const y = height / 2 + 1;

    firstPage.drawText(studentName, {
      x,
      y,
      size: fontSize,
      font: customFont,
      color: rgb(0, 0, 0),
    });

    const numberFontSize = 24;
    const numberX =  665;
    const numberY =  22

    firstPage.drawText(uniqueNumber, {
      x: numberX,
      y: numberY,
      size: numberFontSize,
      font: customFont,
      color: rgb(1, 0, 0),
    });

    return await pdfDoc.save();
  };

  const handleDownloadAll = async () => {
    if (!fetchedData || fetchedData.scores.length === 0) {
      alert("No data to generate certificates.");
      return;
    }

    const zip = new JSZip();

    for (let index = 0; index < fetchedData.scores.length; index++) {
      const score = fetchedData.scores[index];
      const uniqueNumber = `${username?.match(/\d+/g)?.join("") || "000"}${index + 1}`;
      const pdfBytes = await generateCertificate(score.studentName, uniqueNumber);

      zip.file(`Certificate_${score.studentName.replace(/\s+/g, "_")}.pdf`, pdfBytes);
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "Certificates.zip");
    });
  };
  
  
  return (
    <div>
      <div className="shadow-lg">
        <Header />
        <div className="bg-gray-50 h-[100vh]">
        <div className="flex items-center justify-center gap-[80px] p-4">
            <button
              onClick={handleFetchDetails}
              disabled={isFetching}
              className="p-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
            >
              {isFetching ? "Loading..." : "Fetch Data"}
            </button>

            <button
              onClick={handleDownloadAll}
              disabled={!fetchedData || fetchedData.scores.length === 0}
              className="p-2 bg-green-500 text-white rounded disabled:bg-gray-400"
            >
              Download All
            </button>
          </div>
          {/* School Ranking Section */}
          {schoolRanking && (
            <div className="p-4 mt-4 bg-white rounded shadow">
              <h2 className="text-lg font-bold">School Ranking</h2>
              <p>School Name: {schoolRanking.school}</p>
              <p>Overall Rank: {schoolRanking.rank}</p>
              <p>Average Marks: {schoolRanking.averageMarks.toFixed(2)}</p>
            </div>
          )}

          {/* User Scores with Generate Certificate button for each student */}
          {fetchedData && fetchedData.scores.length > 0 && (
            <div className="p-4 mt-4 bg-white rounded shadow">
              <h2 className="text-lg font-bold">User Details</h2>
              <table className="table-auto w-full mt-4 border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border text-black border-gray-300 p-2">Username</th>
                    <th className="border text-black border-gray-300 p-2">Student Name</th>
                    <th className="border text-black border-gray-300 p-2">Category</th>
                    <th className="border text-black border-gray-300 p-2">Total Marks</th>
                    <th className="border text-black border-gray-300 p-2">Section 1 Marks</th>
                    <th className="border text-black border-gray-300 p-2">Section 2 Marks</th>
                    <th className="border text-black border-gray-300 p-2">Section 3 Marks</th>
                    <th className="border text-black border-gray-300 p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchedData.scores.map((score, index) => (
                    <tr key={score.username}>
                      <td className="border text-black border-gray-300 p-2">{score.username}</td>
                      <td className="border text-black border-gray-300 p-2">{score.studentName}</td>
                      <td className="border text-black border-gray-300 p-2">{score.category}</td>
                      <td className="border text-black border-gray-300 p-2">{score.totalMarks}</td>
                      <td className="border text-black border-gray-300 p-2">{score.section1Marks}</td>
                      <td className="border text-black border-gray-300 p-2">{score.section2Marks}</td>
                      <td className="border text-black border-gray-300 p-2">{score.section3Marks}</td>
                      <td className="border text-black border-gray-300 p-2">
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ECertificate;