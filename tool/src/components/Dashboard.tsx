import React, { useEffect, useState } from "react";
import logo3 from "../assets/logo.svg";
import logo4 from "../assets/Ait.svg";
import { creds } from "../data/creds.ts";
import { useAuth } from "../context/AuthContext";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { schoolRankingData } from "../data/schoolRanking.ts"
// import PDFDownload from "./PdfDownload.tsx";
import {schoolFrequencyData} from "../data/schoolFrequency.ts"
import OpenSans from "../assets/OpenSans-Regular.ttf"
import Poppins from "../assets/Poppins-Regular.ttf"
import Montserrat from "../assets/Montserrat-Regular.ttf"

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

  const totalMarks = schoolFrequencyData.totalMarks;
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
            "Section 3": matchingSchool.section3Rank
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
    const base64Image = "data:image/png;base64,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qEn7cFK8DS9TPXiO7UJjqRNKKRgEgKRIlHX/p/zXwaw8Z1KUwizuctf6kV2A32AB9qoACxsDvOolz8LH3/9GNNZmQTRZMTBFRERERERERERERERERERENA3dv7kV/3rld/DDm+5EKahHfbEDJ9g9eGnQizNLHWhO9qIUWmgTuqM1tFUITIpiaGARIrCAwlNjJdpapCrwWaooTbC3pgG/Dxvx36VG3J1bBoMsWurz+Of3vgkXvvQsaK1ANNkwMEVEREREREREREREREREREQ0jWxp3YOr/mcdvvb9G9FXihCqFIebnbjAduMlcQE16S6oSMGmCqHVUEgQK8BqC+u+k+CU8mEpCTs9NVYij1upRqUMAncupHWfO257zSz80DbgunQOttTOQbYQ43mnHI5PfegtOOm4w0A0mTAwRURERERERERERERERERERDQNtLbtxX+uvQH/88P/w64eA2VTHJV04hWqA6ttBxa4+zASbwpgbAk2kPpRAQKjfOUoabdnlPKVpVKVQrrySXhqXxYpJEoFm/FfgMTdUndciljX4u7cXFwTN+K34VzkM3WoQR/+fs25eMuF52LJgmYQTQYMTBERERERERERERERERERERFNYR1dffjq2p/ja9/7BR7pKkGlwBGlvfhrvRcv1h04rG83AndcMYh8yz2NsSXBk3Ksyrg7Bj3BHNxsm/BdPRsbokYkaYjjlzTiAxe9Ei/7q+cil41ANJEYmCIiIiIiIiIiIiIiIiIiIiKaggrFEq79yc340jd+iAe2dyIKQszr7cALox6ch904ttgJlSZACBhrkfqklEVgAowlCZ5IhSoJTSU6RSa1iAOFx3Jz8OPiPFxn52JHXT2CtA8vf/5JePdb/wYnn3A0iCYKA1NEREREREREREREREREREREU0icpPjuT2/G5766Dpu37UUpUFjU14kXRL34a9uKY5K9iKyCsRIMAQKJNKkExteWCqDHOCniA1P+jvXXF6Ug8eOkKou7wtn4oZ2D9ZiDQiaH2pzF3778eXj3216GubObQHSoMTBFRERERERERERERERERERENAUkqcGNt/wJn7jyWjy4cScKSmG26cRptg8vtx04Lt2LxiSPRAWwykBbA4MMrMSZlLTiS30lKDvmTfmUv6XSC3DfR9z4Ut5K7ncGDfhtOAvXJM24OzffzSTF8S21+NBFr8HLX3I6spkQRIcKA1NEREREREREREREREREREREk9yf79mEf7ziv/H7Bx9DvqhRZ3txatqB16AHzyztQqQLvsBT0F9WSqJK2iofnDLuFvo2fBJqktZ5CmNJIlhuKDe2jFdu/Re5v1KlZUQ3voVO3b1AY0uuET+N5+FnahZas7Vuqileeebx+Mi734SjD18CokOBgSkiIiIiIiIiIiIiIiIiIiKiSer+hx/DP17+X/jVnx5HERq1pb14ZtqDl2XyeG7chvq4G4nWUHasY1DjI9GJ+zuLDZn5uKbYhN9F89Ed1aDW5PGeN5+Dd7/9FWioy4FoPDEwRURERERERERERERERERERDTJbN66HVf8+1p8/6a/oCfIIhfHOLWwHedHXXi2aUNTXEDWKBSCALFWiIxUlMKkJ037pPleYFK3rgb8OlqIa00j7s80oVMFOLIpwB9+/CXMaa4H0XgZ66aURERERERERERERERERERERHSQrl9/J9b+/C6U0gDPKrTi/fFDuFxvx1+XtqI5TgAboqAjGESIjIWeIvVyApVC+gWWdAY524cXx4/gk+FWvC7/KOYmBtv3At+77lcgGk8MTBERERERERERERERERERERFNMg9vbgXCGiw2Hfig3YNXpo+jPu0A0looq6GUgUaC0MYIplBzsdTWSj80N/+CtEWDNhpH9m3HBZkOLE/aYVSAUonN0mh8MTBFRERERERERERERERERERENMmc95LnwNo8uqSSlDEIDBAaDaOKgDJwd919DQuNFPJVYSrQtgSrZO6hu8kjBoUgQi4FcjZF4lYif4jGEwNTRERERERERERERERERERERJPMac84DkfMb0a3zuKPUT201Ui0RKOUjxNpE0BJ8qg/KjU14lLwlbFkttr0z1pZBJL+UkWEWqHOpugplkA0nhiYIiIiIiIiIiIiIiIiIiIiIppkanIRnnHiMUiDCI+bCMVAAkblsNEAtc9t6lBP/D0wb+3WFZkUDTpFKdTYsXMPiMYTA1NEREREREREREREREREREREk9BRS+bCqAjbbYSiejJgNFXa71XMLScyMRajgNgYPPTIThCNJwamiIiIiIiIiIiIiIiIiIiIiCahWY11MMqgT2koZWFtBPiWdtOLhUZgEjxNFZAxKe59eCv2dvaBaLwwMEVEREREREREREREREREREQ0CZWKRSikkFZ8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UKFFW16nSZQhJWmXlhVJHGNd+BKZtb0gTy8C4ywGA08SfCn3yatTufCc7eVuXDhHN+1Kk7c8ouTyY7mwbX5MaTkXwkQOxTZ5msaYzB8rDxmVZ3aVcTgV+dct0jTrVT+S50pptwgFhV58Zsl8whrY/Li2Eq4KERLn+vN3eYvB8vhhPDJ2uH7kKO/1F+aj3WA0S/UzUWXYywG9WcjcVX89XbE2lZ1CYEvOZVzx2JVtE12v2pM8tyiBKJVfC1esWy+6JoGmXhu8JF9HlVcVK7exrq4VY36fqGpiKrQp7C0klNboZa1UHqAK5/eDivzYpTmhVnEYq5WqZBKk0iu38qPt46+JcyAiIiIiIiIiIiIiIiIiIiKiPc9Yi/lOtqyoVT8A5mCN7T9XlNeyRbgoD3AVYS1bhsccjDHh+WrcxxYJMRtCZ2bZWKx1NeMz4TzGHytL03w7Y4vQWP+cMg8Tjq/QtXmVrdCiz/YrZLki8FWOw4UAXP69a0MuLA952bLlnpzXFMctKT+3gbJPRVUrY7M8ANWL1vS3S7M0rIlUr9JOhQCd9XML51L5GNPMhsBeCHKlXaT+pSdeehSveNnzQTuLgSkiIiIiIiIiIiIiIiIiIiIiIjpvsDMiERERERERERERERERERERERGdNxiYIiIiIiIiIiIiIiIiIiIiIiKi8wYDU0REREREREREREREREREREREdN5gYIqIiIiIiIiIiIiIiIiIiIiIiM4bDEwREREREREREREREREREREREdF5g4EpIiIiIiIiIiIiIiIiIiIiIiI6bzAwRURERERERERERERERERERERE5w0GpoiIiIiIiIiIiIiIiIiIiIiI6LzBwBQREREREREREREREREREREREZ03GJgiIiIiIiIiIiIiIiIiIiIiIqLzBgNTRERERERERERERERERERERER03mBgioiIiIiIiIiIiIiIiIiIiIiIzhsMTBERERERERERERERERERERER0XmDgSkiIiIiIiIiIiIiIiIiIiIiIjpvMDBFRERERERERERERERERERERETnDQamiIiIiIiIiIiIiIiIiIiIiIjovMHAFBERERERERERERERERERERERnTcYmCIiIiIiIiIiIiIiIiIiIiIiovPG/wQamRX0KTFnSAAAAABJRU5ErkJggg=="; // Your Base64 string
    const heading = "data:image/png;base64,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";
    const blueTab = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAiMAAAAQCAYAAADEW3+bAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABfSURBVHgB7dYxAQAgEAAhtX81ExjmjXELpGDfN7MAACJnAQCEZAQASMkIAJCSEQAgJSMAQEpGAICUjAAAKRkBAFIyAgCkZAQASMkIAJCSEQAgJSMAQEpGAICUjAAAqQ9Q+APGSMAgqgAAAABJRU5ErkJggg==";
    const imageWidth = 200; // Width of the image
    const imageHeight = 30; // Height of the image
    let startY = 1;

    // Add the first image
    pdf.addImage(base64Image, "PNG", 5, startY, imageWidth, imageHeight);
    startY += imageHeight + 5;

    // Add the heading image
    pdf.addImage(heading, "PNG", 13, startY, 185, 8);
    const headingText = "ROUND 1 DETAILED ANALYSIS REPORT"; // Replace with your desired text
    pdf.setFont("helvetica", "normal"); // Set font style
    pdf.setFontSize(12); // Set font size

    // Calculate the text position
    const headingTextX = 13 + (185 / 2); // Center horizontally within the image
    const headingTextY = startY + (8 / 2) + 2.5; // Vertically align within the image (adjust as needed)

    // Add the text, centered on the heading
    pdf.text(headingText, headingTextX, headingTextY, { align: "center" });

    startY += 15; // Move to the next section

    // Add bullet points
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    const bulletPointIcon = "\u2022"; // Unicode for bullet point (•)
    
    // First bullet point
    const firstLine = `${bulletPointIcon} This report consists of details of each category and each section, with the marks and the `;
    const secondLine = ` percentile of the student.`;
    pdf.text(firstLine, 14, startY);
    startY += 7; // Move to the next line
    pdf.text(secondLine, 18, startY); // Indent second line slightly for readability
    startY += 10; // Adjust vertical spacing for the next content
    
    
    // Second bullet point
    const secondPointLine1 = `${bulletPointIcon} In each section, the average of the school and the rank of your school is being provided .`;
    pdf.text(secondPointLine1, 14, startY);
    startY += 5; // Move to the next line
    pdf.setFontSize(18);
    
    pdf.addImage(blueTab, "PNG", 13, startY, 185, 8);
    const tabText = "Overall Performance Of All teams combined"; // Replace with your text
    pdf.setFont("helvetica", "normal"); // Choose font style
    pdf.setFontSize(13); // Set font size

    // Calculate the text position
    const tabTextX = 13 + (185 / 2); // Center the text horizontally within the tab
    const tabTextY = startY + (8 / 2) + 1.5; // Vertically center the text (adjusted for baseline alignment)

    // Add text on the tab (centered)
    pdf.text(tabText, tabTextX, tabTextY, { align: "center" });

    startY += 15; // Move to th
    const schoolRankingInfo = schoolRankingData.find(
      (school) => school.school === schoolName
    );
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("• Here are the scores of all the members that gave the Round 1 quiz and it is out of 100 marks.", 14, startY);
    startY += 6; // Move to the next line for the remaining text


    const mainTableColumns = [
      { header: "Username", dataKey: "username" },
      { header: "Student Name", dataKey: "studentName" },
      { header: "Total Marks", dataKey: "totalMarks" },
      { header: "Percentile", dataKey: "percentile" },
      { header: "Category", dataKey: "category" },
    ];

    // Add school overall statistics
    
    // Get Rows for the Main Table
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
    
    // Add Main Table to PDF
    pdf.autoTable({
      columns: mainTableColumns,
      body: mainTableRows || [],
      startY,
      theme: "striped",
      headStyles: { fillColor: [47, 132, 195] }, // Use the RGB values for #2F84C3
      margin: { left: 14, right: 14 },
    });
    

    startY = pdf.lastAutoTable.finalY + 10;
    const headingImageWidth = 185; // Adjust as per your image size
    const headingImageHeight = 8;  // Adjust as per your image size
    pdf.addImage(blueTab, "PNG", 13, startY, headingImageWidth, headingImageHeight);
    // Calculate text position relative to the blueTab image
    const textY = startY + headingImageHeight / 2 + 1.5; // Center vertically (adjust "+3" for fine-tuning)
    
    // Add text on the blueTab image
    if (schoolRankingInfo) {
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0); // White color for text (to contrast with the blue tab)
      pdf.text(`Overall Rank: ${schoolRankingInfo.rank}`, 20, textY); // Adjust X (20) as needed for horizontal alignment
      pdf.text(`Average Marks: ${schoolRankingInfo.averageMarks.toFixed(2)}`, 120, textY); // Adjust X for second text
    }
    // Update startY for further content
    startY += headingImageHeight + 10;
    
    
    
    // Add Category-Specific Tables with Rankings
    const addCategoryTable = (
      category: "Category 1" | "Category 2",
      sectionNumber: 1 | 2 | 3,
      startY: number
    ) => {
      pdf.setFontSize(14);
      const sectionTitle = `${category} - Section ${sectionNumber}`;
      pdf.text(sectionTitle, 14, startY);
      startY += 5;

      // Add section-specific statistics
      if (schoolRankingInfo) {
        pdf.setFontSize(10);
        const stats = {
          "Category 1": {
            1: {
              rank: schoolRankingInfo.category1Section1Rank,
              average: schoolRankingInfo.category1Section1Average
            },
            2: {
              rank: schoolRankingInfo.category1Section2Rank,
              average: schoolRankingInfo.category1Section2Average
            },
            3: {
              rank: schoolRankingInfo.category1Section3Rank,
              average: schoolRankingInfo.category1Section3Average
            }
          },
          "Category 2": {
            1: {
              rank: schoolRankingInfo.category2Section1Rank,
              average: schoolRankingInfo.category2Section1Average
            },
            2: {
              rank: schoolRankingInfo.category2Section2Rank,
              average: schoolRankingInfo.category2Section2Average
            },
            3: {
              rank: schoolRankingInfo.category2Section3Rank,
              average: schoolRankingInfo.category2Section3Average
            }
          }
        };

        const currentStats = stats[category][sectionNumber];
        pdf.text(`Section Rank: ${currentStats.rank}`, 14, startY);
        startY += 4;
        pdf.text(`Section Average: ${currentStats.average.toFixed(2)}`, 14, startY);
        startY += 6;
      }

      const sectionKey = `section${sectionNumber}Marks` as keyof UserScore;
      
      const sectionRows = fetchedData?.scores
      .filter((score) => score.category === category)
      .sort((a, b) => {
        const aValue = a[sectionKey] as number;
        const bValue = b[sectionKey] as number;
        return bValue - aValue; // Perform the arithmetic operation
      })
      .map((score) => ({
        username: score.username,
        studentName: score.studentName,
        marks: score[sectionKey],
        totalMarks: score.totalMarks,
      }));
    

      pdf.autoTable({
        columns: [
          { header: "Username", dataKey: "username" },
          { header: "Student Name", dataKey: "studentName" },
          { header: `Section ${sectionNumber} Marks`, dataKey: "marks" },
          { header: "Total Marks", dataKey: "totalMarks" },
        ],
        body: sectionRows || [],
        startY,
        theme: "striped",
        headStyles: { fillColor: [22, 160, 133] },
        margin: { left: 14, right: 14 },
      });

      return pdf.lastAutoTable.finalY + 10;
    };

    // Add tables for Category 1
    startY = addCategoryTable("Category 1", 1, startY);
    if (startY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      startY = 15;
    }
    
    startY = addCategoryTable("Category 1", 2, startY);
    if (startY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      startY = 15;
    }
    
    startY = addCategoryTable("Category 1", 3, startY);
    if (startY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      startY = 15;
    }

    // Add tables for Category 2
    startY = addCategoryTable("Category 2", 1, startY);
    if (startY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      startY = 15;
    }
    
    startY = addCategoryTable("Category 2", 2, startY);
    if (startY > pdf.internal.pageSize.height - 50) {
      pdf.addPage();
      startY = 15;
    }
    
    startY = addCategoryTable("Category 2", 3, startY);
    
    // Save the PDF
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
