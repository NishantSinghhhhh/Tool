import React, { useEffect, useState } from "react";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext.tsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { schoolRankingData } from "../data/schoolRanking.ts"
import {schoolFrequencyData} from "../data/schoolFrequency.ts"
import Poppins from "../assets/Poppins-Regular.ttf"
import Header from "./Dashboard/Header.tsx";
import TableComponent from "./Dashboard/Table.tsx";
import ScoresTable from "./Dashboard/ScoreTable.tsx";
import { schoolAverageData } from "../data/schoolAverage.ts";
import CustomPieChart from "../charts/pieChart.tsx";

interface TableConfig {
  pdf: any;
  blueTab: string;
  headingImageWidth: number;
  headingImageHeight: number;
}

interface UserScore {
  username: string;
  studentName: string;
  category: string;
  totalMarks: number;
  [key: string]: any;
}

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

interface SchoolRankingData {
  school: string;
  averageMarks: number;
  section1Average: number;
  section2Average: number;
  section3Average: number;
  category1Average: number;
  category1Section1Average: number;
  category1Section2Average: number;
  category1Section3Average: number;
  category2Average: number;
  category2Section1Average: number;
  category2Section2Average: number;
  category2Section3Average: number;
  rank: number;
  section1Rank: number;
  section2Rank: number;
  section3Rank: number;
  category1Section1Rank: number;
  category1Section2Rank: number;
  category1Section3Rank: number;
  category2Section1Rank: number;
  category2Section2Rank: number;
  category2Section3Rank: number;
}

const Dashboard: React.FC = () => {
  const { username } = useAuth();
  const [schoolName, setSchoolName] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [fetchedData, setFetchedData] = useState<BackendResponse | null>(null);
  const [schoolRanking, setSchoolRanking] = useState<SchoolRankingData | null>(null);
  const {averages} = schoolAverageData;

  const totalMarks = schoolFrequencyData.totalMarks;
  const category1 = schoolFrequencyData.category1Marks
  const category2 = schoolFrequencyData.category2Marks
  const category1Section1Marks = schoolFrequencyData.category1Section1Marks;
  const category1Section2Marks = schoolFrequencyData.category1Section2Marks;
  const category1Section3Marks = schoolFrequencyData.category1Section3Marks;
  const category2Section1Marks = schoolFrequencyData.category2Section1Marks;
  const category2Section2Marks = schoolFrequencyData.category2Section2Marks;
  const category2Section3Marks = schoolFrequencyData.category2Section3Marks;

  const registerPoppins = (pdf: jsPDF) => {
    pdf.addFileToVFS("Poppins-Regular.ttf", Poppins);
    pdf.addFont("Poppins-Regular.ttf", "Poppins", "normal");
  };
  
  const calculatePercentile = (frequencyData: Record<string, number>, score: number): number => {
    const marksArray = Object.entries(frequencyData)
      .map(([key, value]) => ({
        marks: parseInt(key, 10),
        frequency: value,
      }))
      .sort((a, b) => a.marks - b.marks); 
  
    const totalStudents = marksArray.reduce((acc, curr) => acc + curr.frequency, 0);
    let studentsBelowScore = 0;
  
    
    for (const { marks, frequency } of marksArray) {
      if (marks < score) {
        studentsBelowScore += frequency;
      } else if (marks === score) {
        
        studentsBelowScore += frequency / 2; 
        break;
      }
    }
    const percentile = (studentsBelowScore / totalStudents) * 100;
    return percentile;
  };
  
  
  useEffect(() => {
    const user = creds.find((cred) => cred.username === username);
    if (user) {
      setSchoolName(user.schoolName);
      console.log("Found school name:", user.schoolName);
      
      // Find matching school ranking data
      const matchingSchool = schoolRankingData.find(
        (school) => school.school === user.schoolName
      );
      
      if (matchingSchool) {
        console.log("Found school ranking data:", matchingSchool);
        setSchoolRanking(matchingSchool);
      } else {
        console.log("No matching school found in ranking data");
      }
    }
  }, [username]);


const generateCategoryTables = (
  fetchedData: BackendResponse | null | undefined,
  schoolRankingInfo: any,
  config: TableConfig
): number => {
  // Early return if data is invalid
  if (!fetchedData || !fetchedData.scores) {
    console.error("No valid data available to generate tables");
    return 0;
  }

  const { pdf, blueTab, headingImageWidth, headingImageHeight } = config;
  let startY = 10;

  const renderSingleTable = (
    category: "Category 1" | "Category 2",
    sectionNumber: 0 | 1 | 2 | 3,
    frequencyData: Record<string, number>,
    currentY: number
  ): number => {
    
    const sectionKey = `section${sectionNumber}Marks` as keyof UserScore;
    const sectionRows = fetchedData.scores
    .filter((score) => score.category === category)
    .sort((a, b) => {
      const aValue = a[sectionKey] as number;
      const bValue = b[sectionKey] as number;
      return bValue - aValue;
    })
    .map((score) => {
      const sectionMarks = sectionNumber === 0 ? score.totalMarks : score[sectionKey] as number;
      const percentile = calculatePercentile(frequencyData, sectionMarks);
      return {
        username: score.username,
        studentName: score.studentName,
        marks: sectionMarks,
        percentile: percentile.toFixed(2) + "%"
      };
    });
    
      
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const staticTexts = {
        "Category 1": {
          0: "Total Marks for Category 1",
          1: "Section 1 - Category 1 Details",
          2: "Section 2 - Category 1 Details",
          3: "Section 3 - Category 1 Details",
        },
        "Category 2": {
          0: "Total Marks for Category 2",
          1: "Section 1 - Category 2 Details",
          2: "Section 2 - Category 2 Details",
          3: "Section 3 - Category 2 Details",
        }
      };
      const staticText = staticTexts[category][sectionNumber];
      currentY += 6;
      pdf.addImage(blueTab, "PNG", 14, currentY - 8, headingImageWidth, headingImageHeight);
      pdf.text(staticText, 80, currentY - 2.5);
      currentY += 5;
      
      pdf.autoTable({
        columns: [
          { header: "Username", dataKey: "username" },
          { header: "Student Name", dataKey: "studentName" },
          { header: sectionNumber === 0 ? "Total Marks" : `Section ${sectionNumber} Marks`, dataKey: "marks" },
          { header: "Percentile", dataKey: "percentile" },
        ],
        body: sectionRows,
        startY: currentY,
        theme: "striped",
        headStyles: {
          fillColor: [204, 218, 255], // Bright blue header
          textColor: [0, 0, 0], // White text
          fontStyle: "bold", // Bold header font
          halign: "left", // Center alignment for header text
        },
        styles: {
          font: "helvetica", // Consistent font
          fontSize: 10, // Adjust font size
          textColor: [0, 0, 0], // Black text for rows
          lineWidth: 0.5, // Border thickness
          lineColor: [234, 234, 234], // Light gray borders
        },
        alternateRowStyles: {
          fillColor: [247, 247, 247], // Light gray for alternate rows
        },
        margin: { left: 14, right: 14 }, // Consistent table margin
      });
      
      
      currentY = pdf.lastAutoTable.finalY + 10;
      
      if (schoolRankingInfo) {
        const stats = {
          "Category 1": {
            0: { rank: schoolRankingInfo.category1Rank, average: schoolRankingInfo.category1Average, NormalisedMarks: averages.section1Average.toFixed(2) },
            1: { rank: schoolRankingInfo.category1Section1Rank, average: schoolRankingInfo.category1Section1Average,  NormalisedMarks: averages.category1Section1Average.toFixed(2) },
            2: { rank: schoolRankingInfo.category1Section2Rank, average: schoolRankingInfo.category1Section2Average,  NormalisedMarks: averages.category1Section2Average.toFixed(2) },
            3: { rank: schoolRankingInfo.category1Section3Rank, average: schoolRankingInfo.category1Section3Average,  NormalisedMarks: averages.category1Section3Average.toFixed(2) },
          },
          "Category 2": {
            0: { rank: schoolRankingInfo.category2Rank, average: schoolRankingInfo.category2Average ,  NormalisedMarks: averages.category2Average.toFixed(2)},
            1: { rank: schoolRankingInfo.category2Section1Rank, average: schoolRankingInfo.category2Section1Average ,  NormalisedMarks: averages.category2Section1Average.toFixed(2)},
            2: { rank: schoolRankingInfo.category2Section2Rank, average: schoolRankingInfo.category2Average,  NormalisedMarks: averages.category2Section2Average.toFixed(2) },
            3: { rank: schoolRankingInfo.category2Section3Rank, average: schoolRankingInfo.category2Section3Average,  NormalisedMarks: averages.category2Section2Average.toFixed(2) },
          },
        };
        
        pdf.setFontSize(12);
        pdf.addImage(blueTab, "PNG", 13, currentY - 8, headingImageWidth, headingImageHeight);
        const currentStats = stats[category][sectionNumber];
        const rankY = currentY - 3;
        pdf.text(`Section Rank: ${currentStats.rank}`, 20, rankY);
        pdf.text(`Normalised Marks: ${currentStats.NormalisedMarks}`, 80, rankY);
        pdf.text(`School's Average: ${currentStats.average.toFixed(2)}`, 144, rankY);
        currentY += headingImageHeight + 8;
      }
      
      return currentY;
    };
    
    const categories: Array<["Category 1" | "Category 2", number, any]> = [
      ["Category 1", 0, category1],
      ["Category 1", 1, category1Section1Marks],
      ["Category 1", 2, category1Section2Marks],
      ["Category 1", 3, category1Section3Marks],
      ["Category 2", 0, category2],
      ["Category 2", 1, category2Section1Marks],
      ["Category 2", 2, category2Section2Marks],
      ["Category 2", 3, category2Section3Marks],
    ];
    
  categories.forEach(([category, section, frequencyData], index) => {

    if (category === "Category 1" && section === 3 && frequencyData === category1Section3Marks) {
      pdf.addPage();
      startY = 20; // Reset startY for the new page
    }
    else if (category === "Category 2" && section === 2 && frequencyData === category2Section2Marks) {
      pdf.addPage();
      startY = 20; // Reset startY for the new page
    }
  
    // Render the table
    startY = renderSingleTable(category, section as 0 | 1 | 2 | 3, frequencyData, startY);
    startY += index === 5 ? 20 : 5;
  });
  return startY;
};

  const handleFetchDetails = async () => {
    if (!schoolName || schoolName.trim() === "") {
      alert("School name is not valid.");
      return;
    }

    setIsFetching(true);

    try {
      // Your existing fetch logic remains here...
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
      
      console.log(data)
      // Find matching school ranking data
      const matchingSchool = schoolRankingData.find(
        (school) => school.school === schoolName
      );
      
      if (matchingSchool) {
        console.log("School Ranking Details:", {
          "School Name": matchingSchool.school,
          "Overall Rank": matchingSchool.rank,
          "Average Marks": matchingSchool.averageMarks.toFixed(2),
          "Section Rankings": {
            "Section 1": matchingSchool.section1Rank,
            "Section 2": matchingSchool.section2Rank,
            "Section 3": matchingSchool.section3Rank,
            // "Category 1": matchingSchool.category1Rank,

          },
          "Category 1 Averages": {
            "Overall": matchingSchool.category1Average.toFixed(2),
            "Section 1": matchingSchool.category1Section1Average.toFixed(2),
            "Section 2": matchingSchool.category1Section2Average.toFixed(2),
            "Section 3": matchingSchool.category1Section3Average.toFixed(2)
          },
          "Category 2 Averages": {
            "Overall": matchingSchool.category2Average.toFixed(2),
            "Section 1": matchingSchool.category2Section1Average.toFixed(2),
            "Section 2": matchingSchool.category2Section2Average.toFixed(2),
            "Section 3": matchingSchool.category2Section3Average.toFixed(2)
          }
        });
        setSchoolRanking(matchingSchool);
      }

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
    registerPoppins(pdf);
   
  
    // Add Title
    pdf.setFont("Poppins", "normal");
    const base64Image = "data:image/png;base64,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AAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYMIgMAUAAAAAAAAAAAAAAABgwiAwBQAAAAAAAAAAAAAAAGDCIDAFAAAAAAAAAAAAAAAAYML4/wFVuKEeN1hpAAAAAABJRU5ErkJggg==";
    const heading = "data:image/png;base64,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";
    const blueTab = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAiMAAAAQCAYAAADEW3+bAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABfSURBVHgB7dYxAQAgEAAhtX81ExjmjXELpGDfN7MAACJnAQCEZAQASMkIAJCSEQAgJSMAQEpGAICUjAAAKRkBAFIyAgCkZAQASMkIAJCSEQAgJSMAQEpGAICUjAAAqQ9Q+APGSMAgqgAAAABJRU5ErkJggg==";
    const footer = "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAlMAAAAGCAYAAADnnRuFAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAA4SURBVHgB7dZBAQAgCAQwtJAlbWYw6cB9txRb575fAACM7AIAYEymAAACMgUAEJApAICATAEABBqkYgKBsRWkaAAAAABJRU5ErkJggg=="

    const imageWidth = 200;
    const imageHeight = 30;
    let startY = 1;
    pdf.addImage(base64Image, "PNG", 5, startY, imageWidth, imageHeight);
    startY += imageHeight + 5;
    pdf.setFontSize(14); // Set font size for the text
    pdf.setTextColor(0, 0, 0); // Set text color (black in this case)
    pdf.text("NAVYUG Inter-APS AI Hackathon", 68, startY-20); 
    const user = creds.find((cred) => cred.username === username);
   if(user){
    // console.log("Found school name:", user.schoolName);
    pdf.text(user.schoolName, 68, startY-10);
   }
    pdf.addImage(heading, "PNG", 13, startY, 185, 8);
    const headingText = "ROUND 1 DETAILED ANALYSIS REPORT";
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    
    const headingTextX = 13 + (185 / 2);
    const headingTextY = startY + (8 / 2) + 2.5;
    
    pdf.text(headingText, headingTextX, headingTextY, { align: "center" });
    
    startY += 15;
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const bulletPointIcon = "\u2022";
    
    const firstLine = `${bulletPointIcon} This report consists of details of each category and each section, with the marks and the `;
    const secondLine = ` percentile of the student.`;
    pdf.text(firstLine, 14, startY);
    startY += 7;
    pdf.text(secondLine, 18, startY);
    startY += 10;
    
    const secondPointLine1 = `${bulletPointIcon} In each section, the average of the school and the rank of your school is being provided .`;
    pdf.text(secondPointLine1, 14, startY);
    startY += 5;
    pdf.setFontSize(18);
    
    pdf.addImage(blueTab, "PNG", 13, startY, 185, 8);
    const tabText = "Overall Performance Of All teams combined";
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(13);
    
    const tabTextX = 13 + (185 / 2);
    const tabTextY = startY + (8 / 2) + 1.5;
    
    pdf.text(tabText, tabTextX, tabTextY, { align: "center" });
    
    startY += 15;
    const schoolRankingInfo = schoolRankingData.find(
      (school) => school.school === schoolName
    );
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("• Here are the scores of all the members that gave the Round 1 quiz and it is out of 100 marks.", 14, startY);
    startY += 6;
    
    const mainTableColumns = [
      { header: "Username", dataKey: "username" },
      { header: "Student Name", dataKey: "studentName" },
      { header: "Total Marks", dataKey: "totalMarks" },
      { header: "Percentile", dataKey: "percentile" },
      { header: "Category", dataKey: "category" },
    ];
    
    const mainTableRows = fetchedData?.scores
      .sort((a, b) => b.totalMarks - a.totalMarks)
      .slice(0, 12)
      .map((score) => {
        const totalMarksPercentile = calculatePercentile(totalMarks, score.totalMarks);
    
        return {
          username: score.username,
          studentName: score.studentName,
          totalMarks: score.totalMarks,
          percentile: totalMarksPercentile.toFixed(2) + "%",
          category: score.category,
        };
      });
    
    pdf.autoTable({
      columns: mainTableColumns,
      body: mainTableRows || [],
      startY,
      theme: "striped",
      headStyles: {
        fillColor: [204, 218, 255], // Bright blue header
        textColor: [0, 0, 0], // Black text
        fontStyle: "bold", // Bold header font
        halign: "left", // Right alignment for header text
      },
      styles: {
        font: "helvetica", // Consistent font
        fontSize: 10, // Adjust font size
        textColor: [0, 0, 0], // Black text for rows
        lineWidth: 0.5, // Border thickness
        lineColor: [234, 234, 234], // Light gray borders
        halign: "left", // Left alignment for row text
      },
      alternateRowStyles: {
        fillColor: [247, 247, 247], // Light gray for alternate rows
      },
      margin: { left: 14, right: 14 },
    });
    
    startY = pdf.lastAutoTable.finalY + 10;
    const headingImageWidth = 182;
    const headingImageHeight = 8;
    pdf.addImage(blueTab, "PNG", 13, startY, headingImageWidth, headingImageHeight);
    const textY = startY + headingImageHeight / 2 + 1.5;
    
    if (schoolRankingInfo) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Overall Rank: ${schoolRankingInfo.rank}`, 20, textY);
      pdf.text(`Normalised Average: ${averages.totalAverage.toFixed()}`, 75, textY);
      pdf.text(`Average Marks: ${schoolRankingInfo.averageMarks.toFixed(2)}`, 144, textY);
    }
    
    startY += headingImageHeight + 10;
    
    const bulletPoints = [
      "The Round 1 quiz showcased incredible talent and enthusiasm among students, reflecting their dedication to academic excellence.",
      "Each participant demonstrated remarkable effort, creativity, and problem-solving abilities.",
      "The results highlighted the diversity of strengths across categories and underlined the competitive spirit of the students.",
      "These performances serve as a reminder of the bright future awaiting these young minds as they grow and excel.",
      "These achievements highlight the promising future that lies ahead for these young individuals as they continue to grow and succeed."
    ];
    
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    const textWidth = 170;
    const bulletIndent = 10;
    bulletPoints.forEach((point) => {
      const lines = pdf.splitTextToSize(point, textWidth - bulletIndent);
    
      pdf.text("•", 14, startY);
      pdf.text(lines, 20, startY);
    
      startY += lines.length * 6;
    });
    
    pdf.addPage();

    startY = 10;

  // pdf.addImage(footer, "PNG", 13, startY + 5, 185, 1.5);
    
  const config = {
    pdf: pdf, // your jsPDF instance
    blueTab: blueTab, // your blue tab image
    headingImageWidth: headingImageWidth,
    headingImageHeight: headingImageHeight
  };

  generateCategoryTables(fetchedData, schoolRankingInfo, config);

  pdf.save("Round1_Detailed_Results.pdf");
  
  };

  
  const category1Scores = fetchedData?.scores.filter((score) => score.category === "Category 1");
  const category2Scores = fetchedData?.scores.filter((score) => score.category === "Category 2");

  return (
    <div className="h-[130vh] bg-gray-50">
      <Header/>

      <div className="text-center mb-12 mt-16">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Round 1 Detailed Results</h1>
      </div>

      <div className="text-black text-2xl font-bold flex justify-center items-center pb-10">
        {schoolName ? schoolName : "Loading school name..."}
      </div>

      <div className="text-center flex  items-center justify-center gap-[2rem] ">
        <button
          onClick={handleFetchDetails}
          className={`bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 ${
            isFetching ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isFetching}
        >
          {isFetching ? "Fetching..." : "Fetch Details"}
        </button>
      <button
        onClick={generatePDF}
        className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-red-600"
      >
        Download PDF
      </button>

        <div>
        </div>
      </div>

      <div>
      {fetchedData && <ScoresTable scores={fetchedData.scores} totalMarks={totalMarks} />}
    </div>

  <div>

    </div>
    <div className="h-[100vh] hidden bg-gray-50">
      {/* Tables for Category 1 */}
      {fetchedData && (
        <>
           <TableComponent
            category="Category 1"
            section="Total"
            frequencyData={category1} 
            sectionKey="totalMarks" 
            fetchedData={{ ...fetchedData, scores: category1Scores }}
            calculatePercentile={calculatePercentile}
          />
          <TableComponent
            category="Category 1"
            section="Section 1"
            frequencyData={category1Section1Marks}
            sectionKey="section1Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />
          <TableComponent
            category="Category 1"
            section="Section 2"
            frequencyData={category1Section2Marks}
            sectionKey="section2Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />
          <TableComponent
            category="Category 1"
            section="Section 3"
            frequencyData={category1Section3Marks}
            sectionKey="section3Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />

          <TableComponent
            category="Category 2"
            section="Total"
            frequencyData={category2}  
            sectionKey="totalMarks"  
            fetchedData={{ ...fetchedData, scores: category2Scores }}  
            calculatePercentile={calculatePercentile} 
          />
          <TableComponent
            category="Category 2"
            section="Section 1"
            frequencyData={category2Section1Marks}
            sectionKey="section1Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />
          <TableComponent
            category="Category 2"
            section="Section 2"
            frequencyData={category2Section2Marks}
            sectionKey="section2Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />
          <TableComponent
            category="Category 2"
            section="Section 3"
            frequencyData={category2Section3Marks}
            sectionKey="section3Marks"
            fetchedData={fetchedData}
            calculatePercentile={calculatePercentile}
          />
        </>
      )}
    </div>
   
    </div>
  );
};

export default Dashboard;
