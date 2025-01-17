import ReactDOMServer from 'react-dom/server';
import { ReactElement } from 'react';
import html2canvas from 'html2canvas';

const renderToImage = async (component: ReactElement): Promise<string> => {
  // Convert React component to HTML string
  const htmlString = ReactDOMServer.renderToStaticMarkup(component);
  
  // Create a temporary container with proper styling for charts
  const container = document.createElement('div');
  container.innerHTML = htmlString;
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '600px'; // Set fixed width for consistent rendering
  container.style.height = '400px'; // Set fixed height for consistent rendering
  container.style.backgroundColor = 'white'; // Ensure white background
  
  // Add container to document
  document.body.appendChild(container);

  try {
    // Wait for any chart animations/rendering to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Use html2canvas with specific settings for charts
    const canvas = await html2canvas(container, {
      logging: false,
      useCORS: true,
      scale: 2,
      backgroundColor: '#ffffff',
      allowTaint: true,
      foreignObjectRendering: true,
      removeContainer: true,
      width: 600,
      height: 400
    });

    // Convert to image with specific format
    const image = canvas.toDataURL('image/png', 1.0);
    return image;
  } catch (error) {
    console.error('Error rendering chart:', error);
    throw error;
  } finally {
    // Cleanup
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

export default renderToImage;