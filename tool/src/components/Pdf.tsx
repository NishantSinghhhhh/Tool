import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf'; // Import jsPDF
import 'jspdf-autotable'; // Import the autoTable plugin

// Define the type for the Excel data
interface ExcelRow {
  [key: string]: string | number; // The rows can have dynamic keys with string or number values
}

const Pdf: React.FC = () => {
  const [excelData, setExcelData] = useState<ExcelRow[]>([]); // State to hold the Excel data
  const [schoolName, setSchoolName] = useState<string>(''); // State to hold the sheet name

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      // Check if e.target is not null
      const target = e.target;
      if (!target || !target.result) {
        return; // Exit if target or result is null
      }

      const data = new Uint8Array(target.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0]; // Get the sheet name
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
      setExcelData(rows);
      setSchoolName(sheetName); // Set the school name as the sheet name
    };

    reader.readAsArrayBuffer(file);
  };

  // Function to generate PDF
  const generatePdf = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Excel Data', 20, 20);

    // Clean the headings to remove "EMPTY_1" and any other unwanted ones
    const tableColumn = Object.keys(excelData[0]).filter(
      key => key !== 'EMPTY_1' && key.trim() !== '' // Exclude "EMPTY_1" and any empty keys
    );
    
    // Map over the rows and clean up empty or unwanted values
    const tableRows = excelData.map(row => 
      tableColumn.map(key => String(row[key] || '')) // Ensure we don't get undefined or null values
    );

    // Add the table to the PDF
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30, // Position the table below the title
      theme: 'grid', // Add grid lines to the table
      headStyles: { fillColor: [22, 160, 133], textColor: [255, 255, 255], fontSize: 12, fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
    });

    // Save the PDF with the school name as part of the filename
    doc.save(`${schoolName}_result.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8">
      <div className="max-w-4xl w-full px-6 bg-white shadow-xl rounded-lg p-8">
        <h1 className="text-3xl font-semibold text-blue-600 mb-6 text-center">Excel Data Uploader</h1>

        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="mb-6 p-3 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition duration-300 ease-in-out w-full sm:w-auto"
        />

        {excelData.length > 0 && (
          <>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white border-collapse border border-gray-300 rounded-lg shadow-md">
                <thead>
                  <tr className="bg-blue-100 text-blue-800">
                    {Object.keys(excelData[0]).filter(
                      key => key !== 'EMPTY_1' && key.trim() !== ''
                    ).map((key, index) => (
                      <th key={index} className="px-6 py-3 text-left font-medium text-sm border-b border-gray-300">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {excelData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={`${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-200`}
                    >
                      {Object.keys(row).filter(
                        key => key !== 'EMPTY_1' && key.trim() !== ''
                      ).map((key, colIndex) => (
                        <td key={colIndex} className="px-6 py-3 text-sm text-gray-800 border-b border-gray-300">
                          {row[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={generatePdf}
              className="p-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Generate PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Pdf;
