import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

interface BarGraphProps {
  category: string;
  section: string;
  frequencyData: Record<string, number>;
  sectionKey: "section1Marks" | "section2Marks" | "section3Marks" | "totalMarks";
  fetchedData: {
    scores: Array<{
      username: string;
      studentName: string;
      category: string;
      [key: string]: any;
    }>;
    averages?: number[];
    topScorers?: number[];
  };
}

interface SchoolAverages {
  totalAverage: number;
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
}

interface SchoolAverageData {
  success: boolean;
  message: string;
  averages: SchoolAverages;
}

const schoolAverageData: SchoolAverageData = {
  "success": true,
  "message": "Averages calculated successfully",
  "averages": {
    "totalAverage": 71.33884297520662,
    "section1Average": 25.425619834710744,
    "section2Average": 32.53512396694215,
    "section3Average": 13.37809917355372,
    "category1Average": 64.87391304347825,
    "category1Section1Average": 24.160869565217393,
    "category1Section2Average": 28.52173913043478,
    "category1Section3Average": 12.191304347826087,
    "category2Average": 77.19291338582677,
    "category2Section1Average": 26.570866141732285,
    "category2Section2Average": 36.169291338582674,
    "category2Section3Average": 14.452755905511811
  }
};

const getMaxScore = (sectionKey: string): number => {
  switch (sectionKey) {
    case 'totalMarks':
      return 100;
    case 'section1Marks':
    case 'section2Marks':
      return 40;
    case 'section3Marks':
      return 25;
    default:
      return 100;
  }
};

const getAverageScore = (category: string, sectionKey: string): number => {
  const averages = schoolAverageData.averages;
  const categoryNum = category.toLowerCase().includes('category 1') ? '1' : '2';

  switch (sectionKey) {
    case 'totalMarks':
      return averages[`category${categoryNum}Average` as keyof SchoolAverages] || averages.totalAverage;
    case 'section1Marks':
      return averages[`category${categoryNum}Section1Average` as keyof SchoolAverages] || averages.section1Average;
    case 'section2Marks':
      return averages[`category${categoryNum}Section2Average` as keyof SchoolAverages] || averages.section2Average;
    case 'section3Marks':
      return averages[`category${categoryNum}Section3Average` as keyof SchoolAverages] || averages.section3Average;
    default:
      return 0;
  }
};
const BarGraph: React.FC<BarGraphProps> = ({
    category,
    section,
    frequencyData,
    sectionKey,
    fetchedData,
  }) => {
    const categoryScores = fetchedData.scores
      .filter(score => score.category === category)
      .sort((a, b) => b[sectionKey] - a[sectionKey]);
  
    const topStudents = categoryScores.slice(0, 6);
    const maxScore = getMaxScore(sectionKey);
    const averageScore = getAverageScore(category, sectionKey);
  
    const data = {
      labels: topStudents.map(student => student.studentName),
      datasets: [
        {
          label: `Normalised Average`,
          data: Array(topStudents.length).fill(averageScore),
          backgroundColor: 'rgb(126,198,244)',
          borderColor: 'rgb(39,89,154)',
          borderWidth: 1,
          datalabels: {
            align: 'end',
            anchor: 'end'
          }
        },
        {
          label: `Student Score`,
          data: topStudents.map(student => student[sectionKey]),
          backgroundColor: 'rgba(205,218,254,255)',
          borderColor: 'rgb(39,89,154)',
          borderWidth: 1,
          datalabels: {
            align: 'end',
            anchor: 'end'
          }
        },
        {
          label: `Maximum Score`,
          data: Array(topStudents.length).fill(maxScore),
          backgroundColor: 'rgba(62,129,203,255)',
          borderColor: 'rgb(39,89,154)',
          borderWidth: 1,
          datalabels: {
            align: 'end',
            anchor: 'end'
          }
        }
      ],
    };
  
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `${category} - ${section} Performance`,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function(context: any) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`;
            }
          }
        },
        datalabels: {
          display: true,
          color: '#000',
          font: {
            weight: 'bold' as const,
            size: 12
          },
          padding: {
            top: 0,
            bottom: 0
          },
          formatter: function(value: number) {
            return value.toFixed(1);
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: maxScore + (maxScore * 0.15), // Increased padding for labels
          title: {
            display: true,
            text: 'Marks',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Students',
          },
        },
      },
    };
  
    return (
      <div className="w-full max-w-7xl mx-auto bg-inherit rounded-xl p-6 mt-10">
        <div style={{ height: '500px' }}>
          <Bar data={data} options={options} />
        </div>
      </div>
    );
  };
  
  export default BarGraph;