import React from "react";

interface TableComponentProps {
  category: string;
  section: string;
  frequencyData: Record<string, number>;
  sectionKey: "section1Marks" | "section2Marks" | "section3Marks" | "totalMarks";
  fetchedData: any; // Define the type according to your data structure
  calculatePercentile: (frequencyData: Record<string, number>, sectionMarks: number) => number;
}

const TableComponent: React.FC<TableComponentProps> = ({
  category,
  section,
  frequencyData,
  sectionKey,
  fetchedData,
  calculatePercentile,
}) => {
  // Filtered data based on the category
  const filteredData =
    fetchedData?.scores?.filter((score: any) => score.category === category) || [];

  // If no data is available, don't render the table (takes no space)
  if (filteredData.length === 0) {
    return null;
  }

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
            {filteredData
              .sort((a: any, b: any) => b[sectionKey] - a[sectionKey]) // Sort descending by section marks
              .map((score: any, index: number) => {
                const percentile = calculatePercentile(frequencyData, score[sectionKey]);

                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
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
                      <span className="text-sm font-medium text-gray-900">
                        {percentile.toFixed(2)}%
                      </span>
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

export default TableComponent;
