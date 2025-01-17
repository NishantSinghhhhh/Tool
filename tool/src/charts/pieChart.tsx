import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData, ChartOptions } from "chart.js";

// Register necessary chart elements
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  category: string;
  section: string;
  frequencyData: Record<string, number>;
  sectionKey: "section1Marks" | "section2Marks" | "section3Marks" | "totalMarks";
  fetchedData: any; // Define the type according to your data structure
}

const CustomPieChart: React.FC<PieChartProps> = ({
  category,
  section,
  frequencyData,
  sectionKey,
  fetchedData,
}) => {
  // Check if the fetched data is valid
  if (!fetchedData || !fetchedData.scores) {
    return <div>No data available</div>;
  }

  // Process the data
  const data = fetchedData.scores
    .filter((score: any) => score.category === category) // Filter by category
    .map((score: any) => ({
      name: score.studentName,
      value: score[sectionKey], // Dynamically use sectionKey (e.g., section1Marks, section2Marks)
    }));

  // Ensure there's data for the Pie Chart
  if (data.length === 0) {
    return <div>No data for this category and section</div>;
  }

  // Prepare the chart data for Chart.js
  const chartData: ChartData<'pie'> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6347"], // Custom colors for slices
        borderWidth: 1,
      },
    ],
  };

  // Custom Chart.js options to disable tooltip and render text in the pie chart
  const options: ChartOptions<'pie'> = {
    plugins: {
      tooltip: {
        enabled: false, // Disable tooltip
      },
      datalabels: {
        display: true,
        color: "white",
        font: {
          weight: "bold",
        },
        formatter: (value: number, ctx: any) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return `${label}: ${value}`; // Display text on the chart slices
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-80">
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">{`${category} - ${section}`}</h3>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default CustomPieChart;
