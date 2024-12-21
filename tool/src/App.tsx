import { useState, FormEvent } from "react";
import * as XLSX from "xlsx";

function App() {
  const [inputText, setInputText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [tableData, setTableData] = useState<any | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

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
      setTableData(data);
      setSuccess(true);
      setInputText("");
      console.log("Success:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error:", err);
    }
  };

  const scores = tableData?.scores || [];
  const userInfo = tableData?.userInfo || [];

  const exportToExcel = () => {
    if (!tableData) return;

    const wsData = [];

    const schoolName = userInfo.length > 0 ? userInfo[0].schoolName : "Unknown School";
    wsData.push([schoolName]);

    const studentInfoRow = ['Student Name', 'Category', 'Username', 'Marks Scored'];
    wsData.push(studentInfoRow);

    userInfo.forEach((user: any) => {
      const score = scores.find((s: [string, number]) => s[0] === user.username);
      wsData.push([user.student, user.category, user.username, score ? score[1] : 'N/A']);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    ws['!cols'] = [
      { wpx: 200 },
      { wpx: 150 },
      { wpx: 150 },
      { wpx: 100 },
    ];

    XLSX.writeFile(wb, `${schoolName}_report.xlsx`);
  };

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">My App</h1>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">
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
                         shadow-sm transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         placeholder:text-gray-400"
              />

              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 transition-colors duration-200"
              >
                Submit
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              {success && (
                <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-lg">
                  Successfully submitted!
                </div>
              )}
            </form>

            <h2 className="text-lg font-bold mt-6">Scores</h2>
            <table className="table-auto border-collapse border border-gray-300 w-full text-left mb-6">
              <thead>
                <tr>
                  <th className="border text-black border-gray-300 px-4 py-2">Username</th>
                  <th className="border text-black border-gray-300 px-4 py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score: [string, number], index: number) => (
                  <tr key={index}>
                    <td className="border text-black border-gray-300 px-4 py-2">{score[0]}</td>
                    <td className="border text-black border-gray-300 px-4 py-2">{score[1]}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <h2 className="text-lg font-bold mt-6">User Info</h2>
            <table className="table-auto border-collapse border border-gray-300 w-full text-left">
              <thead>
                <tr>
                  <th className="border text-black border-gray-300 px-4 py-2">Username</th>
                  <th className="border text-black border-gray-300 px-4 py-2">Student</th>
                  <th className="border text-black border-gray-300 px-4 py-2">School Name</th>
                  <th className="border text-black border-gray-300 px-4 py-2">Category</th>
                </tr>
              </thead>
              <tbody>
                {userInfo.map((user: any, index: number) => (
                  <tr key={index}>
                    <td className="border text-black border-gray-300 px-4 py-2">{user.username}</td>
                    <td className="border text-black border-gray-300 px-4 py-2">{user.student}</td>
                    <td className="border text-black border-gray-300 px-4 py-2">{user.schoolName}</td>
                    <td className="border text-black border-gray-300 px-4 py-2">{user.category}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={exportToExcel}
              className="mt-8 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export to Excel
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
