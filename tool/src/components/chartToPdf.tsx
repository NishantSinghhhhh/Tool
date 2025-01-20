import React, { useRef } from 'react';
import domtoimage from 'dom-to-image-more';
import jsPDF from 'jspdf';

interface ChartToPdfProps {
  chartContent: React.ReactNode; // The chart or content to render
  pdfFileName?: string; // Optional file name for the PDF
  chartWidth?: number; // Optional width for the chart container
  chartHeight?: number; // Optional height for the chart container
}

const ChartToPdf: React.FC<ChartToPdfProps> = ({
  chartContent,
  pdfFileName = 'chart.pdf',
  chartWidth = 400,
  chartHeight = 300,
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);

  const downloadPdf = async () => {
    if (!chartRef.current) {
      console.error('Chart reference not found.');
      return;
    }

    try {
      const dataUrl = await domtoimage.toPng(chartRef.current);
      const pdf = new jsPDF();

      const imgWidth = 190; // Fit width into the PDF (adjustable)
      const imgHeight =
        (chartRef.current.offsetHeight / chartRef.current.offsetWidth) * imgWidth;

      pdf.addImage(dataUrl, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(pdfFileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      <div
        ref={chartRef}
        style={{
          width: chartWidth,
          height: chartHeight,
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          padding: '10px',
        }}
      >
        {chartContent}
      </div>
      <button
        onClick={downloadPdf}
        style={{
          marginTop: '10px',
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Download PDF
      </button>
    </div>
  );
};

export default ChartToPdf;
