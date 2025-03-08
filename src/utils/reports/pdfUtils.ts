
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "sonner";

// Add Arabic font support to jsPDF
export const configurePdfForArabic = (pdf: jsPDF) => {
  pdf.setFont("Helvetica");
  pdf.setR2L(true); // Enable right-to-left for Arabic text
  return pdf;
};

// Convert a component to an image and add it to PDF
export const addElementToPdf = async (
  elementId: string, 
  pdf: jsPDF, 
  options: { 
    x?: number; 
    y?: number; 
    width?: number;
    height?: number;
    pageBreak?: boolean;
  } = {}
): Promise<number> => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with ID ${elementId} not found`);
      return 0;
    }

    // Use html2canvas to capture the component
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    // Check if we need a page break
    if (options.pageBreak) {
      pdf.addPage();
    }

    // Add the image to the PDF
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = options.width || pdf.internal.pageSize.getWidth() - 20;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const x = options.x || 10;
    const y = options.y || 10;

    pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

    // Return the y position after this element
    return y + imgHeight;
  } catch (error) {
    console.error("Error adding element to PDF:", error);
    return 0;
  }
};

// Export charts as separate images
export const exportChartToPng = async (chartId: string): Promise<string> => {
  try {
    const element = document.getElementById(chartId);
    if (!element) {
      console.error(`Chart element with ID ${chartId} not found`);
      return "";
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    });

    return canvas.toDataURL("image/png");
  } catch (error) {
    console.error("Error exporting chart:", error);
    return "";
  }
};

// Generate a PDF filename with current date
export const generatePdfFilename = (baseName: string): string => {
  const date = new Date().toISOString().split("T")[0];
  return `${baseName}-${date}.pdf`;
};
