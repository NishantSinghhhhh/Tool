import { useState, FormEvent } from "react";
import * as XLSX from "xlsx";

type UserInfo = {
  _id: string;
  username: string;
  password: string;
  setid: string;
  schoolName: string;
  student: string;
  category: string;
  timeLeft: number | string;
  submitted: number;
  __v: number;
  marks?: number; // Added for sorting
};


type MarkInfo = {
  username: string;
  marks: number;
};

type ProcessedUserWithAverages = {
  schoolGroup: UserInfo[];
  averages: number[];
};

type Data = {
  users: UserInfo[][];
  marks: MarkInfo[][];
};

function Excel() {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tableData, setTableData] = useState<any | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const staticTexts = {
      "Category 1": {
        0: "Total Marks for Category 1",
        1: "Section 1 - Category 1 Details",
        2: "Section 2 - Category 1 Details",
        3: "Section 3 - Category 1 Details",
      },
      "Category t2": {
        0: "Total Marks for Category 2",
        1: "Section 1 - Category 2 Details",
        2: "Section 2 - Category 2 Details",
        3: "Section 3 - Category 2 Details",
      }
    };
      
    try {
      const response = await fetch("http://localhost:7009/result/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Process and sort the data before setting it
      const processedData = processAndSortData(data);
      setTableData(processedData);
      setSuccess(true);
      setInputText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    }
  };

  const processAndSortData = (data: Data) => {
    if (!data.users || !data.marks) return data;
  
    // Process each school group
    const processedUsers: UserInfo[][] = data.users.map(
      (schoolGroup: UserInfo[], schoolIndex: number) => {
        // Add marks to each user object
        const usersWithMarks = schoolGroup.map(user => {
          const markEntry = data.marks[schoolIndex]?.find(
            (mark: MarkInfo) => mark.username === user.username
          );
          return {
            ...user,
            marks: markEntry?.marks || 0,
          };
        });
  
        // Sort users within school by setId (ascending)
        return usersWithMarks.sort((a, b) => {
          const setIdA = parseInt(a.setid, 10);
          const setIdB = parseInt(b.setid, 10);
          return setIdA - setIdB;
        });
      }
    );
  
    // Calculate average marks in sets of 3
    const calculateAveragesInSets = (users: UserInfo[]): number[] => {
      const averages: number[] = [];
      for (let i = 0; i < users.length; i += 3) {
        const group = users.slice(i, i + 3);
        const totalMarks = group.reduce((sum, user) => sum + (user.marks || 0), 0);
        const average = totalMarks / group.length;
        averages.push(average);
      }
      return averages;
    };
  
    // Process and add averages for each school
    const processedUsersWithAverages: ProcessedUserWithAverages[] =
      processedUsers.map((schoolGroup: UserInfo[]) => {
        const averages = calculateAveragesInSets(schoolGroup);
        return { schoolGroup, averages };
      });
  
    return {
      ...data,
      users: processedUsersWithAverages.map(item => item.schoolGroup),
      averages: processedUsersWithAverages.map(item => item.averages),
      marks: data.marks,
    };
  };
  
  const average3 = (mark1: number, mark2: number, mark3: number): number => {
    return (mark1 + mark2 + mark3) / 3;
  };
  
  const exportToExcel = () => {
    if (!tableData || !tableData.users || !Array.isArray(tableData.users)) return;

    const wb = XLSX.utils.book_new();

    const colWidths = [
      { wch: 5 },  // S.No.
      { wch: 20 }, // Student Name
      { wch: 15 }, // Category
      { wch: 15 }, // Username
      { wch: 10 }, // Marks
      { wch: 10 }, // Time Left
      { wch: 15 }  // Set ID
    ];

    tableData.users.forEach((schoolGroup: UserInfo[], schoolIndex: number) => {
      if (!schoolGroup || !schoolGroup.length) return;

      const schoolName = schoolGroup[0]?.schoolName || `School ${schoolIndex + 1}`;
      const wsData = [
        [schoolName], // School name as header
        [], // Empty row for spacing
        [
          "S.No.",
          "Student Name",
          "Category",
          "Username",
          "Marks",
          "Time Left",
          "Set ID"
        ]
      ];

      // Add sorted student data
      schoolGroup.forEach((student: UserInfo, index: number) => {
        const categoryLabel =
          student.category === "1" ? "VI-VII" :
          student.category === "2" ? "VIII & IX" :
          student.category;

          wsData.push([
            (index + 1).toString(), // Convert to string
            student.student || "N/A",
            categoryLabel,
            student.username || "N/A",
            (student.marks || "N/A").toString(), // Convert to string
            student.timeLeft === "0" ? "0" : student.timeLeft.toString(), // Ensure it's a string
            student.setid || "N/A",
          ]);
          
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!cols"] = colWidths;

      const safeSheetName = schoolName
        .replace(/[\\*?[\]/]/g, "")
        .substring(0, 31);

      XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
    });

    XLSX.writeFile(wb, "all_schools_report_sorted.xlsx");
  };

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="w-[80vw] mx-auto p-6">
        <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 mb-8">
              Welcome to the Home Page
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setError(null);
                }}
                placeholder="Enter text here"
                className="w-full md:w-2/3 p-3 border border-gray-200 rounded-xl 
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>
              )}
              {success && (
                <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-lg">
                  Successfully submitted!
                </div>
              )}
            </form>
            {tableData && (
  <div className="mt-8">
    {tableData.users?.map((userGroup: any[], groupIndex: number) => {
      const schoolName = userGroup[0]?.schoolName || "Unknown School";
      const schoolAverage = userGroup.reduce((sum, user) => sum + (user.marks || 0), 0) / userGroup.length;

      // Break userGroup into chunks of 3 for calculating team averages
      const groupedUsers = [];
      for (let i = 0; i < userGroup.length; i += 3) {
        groupedUsers.push(userGroup.slice(i, i + 3));
      }

      return (
        <div key={`school-${groupIndex}`}>
          <h3 className="text-2xl font-semibold text-black mb-2">{schoolName}</h3>
          <p className="text-gray-600 mb-4">Average Score: {schoolAverage.toFixed(2)}</p>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2 border border-gray-300 text-black">S.No.</th>
                <th className="p-2 border border-gray-300 text-black">Student Name</th>
                <th className="p-2 border border-gray-300 text-black">Category</th>
                <th className="p-2 border border-gray-300 text-black">Username</th>
                <th className="p-2 border border-gray-300 text-black">Marks</th>
                <th className="p-2 border border-gray-300 text-black">Time Left</th>
                <th className="p-2 border border-gray-300 text-black">Set ID</th>
                <th className="p-2 border border-gray-300 text-black">Team Average</th>
              </tr>
            </thead>
            <tbody>
              {groupedUsers.map((group, groupIndex) =>
                group.map((user: any, index: number) => (
                  <tr key={user._id || `${groupIndex}-${index}`} className="text-black">
                    <td className="p-2 border border-gray-300">
                      {index + 1 + groupIndex * 3}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {user.student || "N/A"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {user.category === "1"
                        ? "VI-VII"
                        : user.category === "2"
                        ? "VIII & IX"
                        : user.category || "N/A"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {user.username || "N/A"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {user.marks || "N/A"}
                    </td>
                    <td className="p-2 border border-gray-300">
                      {user.timeLeft === "0" ? 0 : user.timeLeft}
                    </td>
                    <td className="p-2 border border-gray-300">{user.setid}</td>
                    {index === group.length - 1 && (
                      <td className="p-2 border border-gray-300 font-bold text-center">
                        {average3(
                          group[0]?.marks || 0,
                          group[1]?.marks || 0,
                          group[2]?.marks || 0
                        ).toFixed(2)}
                      </td>
                    )}
                    {index !== group.length - 1 && (
                      <td className="p-2 border border-gray-300"></td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      );
    })}
  </div>
)}

            <button
              onClick={exportToExcel}
              className="mt-8 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              disabled={!tableData}
            >
              Export to Excel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Excel;