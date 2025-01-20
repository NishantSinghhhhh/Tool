import { PDFDocument, rgb } from 'pdf-lib';

// Function to compress the PDF
async function compressPDF(pdfBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { updateMetadata: false });

  // Remove metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('');
  pdfDoc.setCreator('');

  const pages = pdfDoc.getPages();
  console.log('Processing', pages.length, 'pages');

  // You can also add any other optimization steps, e.g., removing unnecessary objects, or reducing image sizes if applicable

  // Here, we don't need to access the content stream directly. Instead, just process the pages as needed:
  for (const page of pages) {
    const { width, height } = page.getSize();

    // Optionally, draw a white rectangle to reduce the file size
    page.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: height,
      color: rgb(1, 1, 1),
    });
  }

  // Save the compressed PDF
  const compressedPdf = await pdfDoc.save({
    useObjectStreams: true,
    objectsPerTick: 20,
    updateFieldAppearances: true,
  });

  console.log('Compression complete. New size:', (compressedPdf.byteLength / 1024).toFixed(2), 'KB');
  return compressedPdf;
}

// Usage example
(async () => {
  const pdfBytes = new Uint8Array(); // Replace with your input PDF bytes
  const compressedBytes = await compressPDF(pdfBytes);

  // Download the compressed PDF
  const blob = new Blob([compressedBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'Compressed.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
})();
