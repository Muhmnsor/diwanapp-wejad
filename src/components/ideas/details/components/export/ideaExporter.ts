
import { fetchIdeaData } from "./services/fetchIdeaData";
import { exportToText } from "./services/exportText";
import { exportToPdf } from "./services/exportPdf";
import { exportToZip } from "./services/exportZip";

interface ExportOptions {
  ideaId: string;
  ideaTitle: string;
  exportOptions: string[];
  exportFormat: string;
}

/**
 * Main function to export an idea in the selected format with selected options
 */
export const exportIdea = async ({
  ideaId,
  ideaTitle,
  exportOptions,
  exportFormat,
}: ExportOptions) => {
  try {
    console.log("=== Starting export process ===");
    console.log("Idea ID:", ideaId);
    console.log("Idea title:", ideaTitle);
    console.log("Export options:", exportOptions);
    console.log("Export format:", exportFormat);

    // Fetch data based on selected options
    const data = await fetchIdeaData(ideaId, exportOptions);
    
    // Export data in the selected format
    if (exportFormat === "pdf") {
      await exportToPdf(data, ideaTitle, exportOptions);
    } else if (exportFormat === "text") {
      exportToText(data, ideaTitle);
    } else if (exportFormat === "zip") {
      await exportToZip(data, ideaTitle, exportOptions);
    } else {
      throw new Error("Unsupported export format");
    }
    
    console.log("=== Export process completed successfully ===");
  } catch (error) {
    console.error("Error in export process:", error);
    throw error;
  }
};
