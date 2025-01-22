import React, { useEffect, useState } from 'react';
import Header from './Dashboard/Header';
import { useAuth } from '../context/AuthContext';
import { schoolRankingData } from "../data/schoolRanking.ts";
import { creds } from "../data/creds.ts";
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
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
  
    // Correctly embed the standard font using the StandardFonts enum
    const normalFont = await pdfDoc.embedStandardFont(StandardFonts.Helvetica);
  
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
    const navFontSize = 12;
    const numberX = 665;
    const numberY = 22;
  
    // Draw "NAV" with the normal font
    firstPage.drawText("NAV-", {
      x: numberX,
      y: numberY,
      size: navFontSize,
      font: normalFont,
      color: rgb(1, 0, 0), // Black color
    });
  
    // Measure the width of "NAV" to adjust the position of the unique number
    const navTextWidth = normalFont.widthOfTextAtSize("NAV", navFontSize);
  
    // Draw the unique number with the custom font after "NAV"
    firstPage.drawText(uniqueNumber, {
      x: numberX + navTextWidth + 5, // Add a small gap after "NAV"
      y: numberY,
      size: numberFontSize,
      font: customFont,
      color: rgb(1, 0, 0), // Red color
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
      <div className="shadow-lg bg-gray-50">
        <Header />
        <div className="bg-gray-50 h-[100vh]">
        <div className="flex items-center justify-center gap-[80px] mt-[2rem] p-4">
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

       
          {fetchedData && fetchedData.scores.length > 0 && (
            <div className='text-black h-[200px] w-[100vw] flex items-center justify-center font-bold text-xl'>
              The pdfs are generated , now  you may proceed to download them 
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ECertificate;