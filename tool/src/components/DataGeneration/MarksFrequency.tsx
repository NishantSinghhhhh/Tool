import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.svg";
import logo4 from "../../assets/Ait.svg";

type SchoolRankingData = {
  name: string;
  rank: number;
}[];

const MarksFrequency: React.FC = () => {
  const [data, setData] = useState<SchoolRankingData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:7009/datatoJson/SchoolFrequecny", {
        method: "POST", // Changed to POST to send data
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ startProcess: true }), // Sending boolean data
      });
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const result: SchoolRankingData = await response.json();
      setData(result);
  
      // Save the fetched data to a .ts file in JSON format
      const fileContent = `export const schoolRankingData = ${JSON.stringify(result, null, 2)};`;
      const blob = new Blob([fileContent], { type: "text/javascript" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "schoolRanking.ts";
      link.click();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <>
      <div>
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-20">
              <img src={logo} alt="Logo" className="h-12 w-auto" />
              <img src={logo4} alt="AWES Logo" className="h-12" />
            </div>
          </div>
        </nav>
        <div className="flex items-center justify-center min-h-screen text-black bg-gray-100">
          <div className="text-center">
            <button
              onClick={fetchData}
              className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Loading..." : "Fetch School Ranking"}
            </button>
            {error && <p className="text-red-500 mt-4">Error: {error}</p>}
            {data && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold">School Ranking Data:</h3>
                <pre className="bg-white p-4 rounded shadow text-left">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MarksFrequency;
