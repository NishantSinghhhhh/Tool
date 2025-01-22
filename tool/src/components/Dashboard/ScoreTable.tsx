import React from "react";

interface Score {
  username: string;
  studentName: string;
  totalMarks: number;
  category: string;
}

interface ScoresTableProps {
  scores: Score[];
  totalMarks: Record<string, number>;
}

const ScoresTable: React.FC<ScoresTableProps> = ({ scores, totalMarks }) => {
  const calculatePercentile = (maxMarks: number, studentMarks: number): number => {
    if (studentMarks > maxMarks) {
        throw new Error("Student marks cannot exceed maximum marks.");
    }

    const percentage = (studentMarks / maxMarks) * 100;

    return Math.round(percentage * 100) / 100; // Round to 2 decimal places
};
  return (
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
                Percentage
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                Category
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Render Category 1 */}
            {scores
              .filter((score) => score.category === "Category 1")
              .sort((a, b) => b.totalMarks - a.totalMarks)
              .map((score, index) => {
                const percentile = calculatePercentile(100, score.totalMarks);
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
            {scores
              .filter((score) => score.category === "Category 2")
              .sort((a, b) => b.totalMarks - a.totalMarks)
              .map((score, index) => {
                const percentile = calculatePercentile(100, score.totalMarks);
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
  );
};

export default ScoresTable;
