
import { fetchIdeaData } from "./services/fetchIdeaData";
import { exportToText } from "./services/exportText";
import { exportToPdf } from "./services/exportPdf";
import { exportToZip } from "./services/exportZip";
import { toast } from "sonner";

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

    if (!ideaId) {
      throw new Error("معرف الفكرة غير صالح");
    }

    if (!exportOptions || exportOptions.length === 0) {
      throw new Error("الرجاء تحديد خيارات التصدير");
    }

    if (!exportFormat) {
      throw new Error("الرجاء تحديد صيغة التصدير");
    }

    // Fetch data based on selected options
    const data = await fetchIdeaData(ideaId, exportOptions);
    
    if (!data) {
      throw new Error("فشل في جلب بيانات الفكرة");
    }
    
    // Export data in the selected format
    if (exportFormat === "pdf") {
      await exportToPdf(data, ideaTitle, exportOptions);
    } else if (exportFormat === "text") {
      exportToText(data, ideaTitle);
    } else if (exportFormat === "zip") {
      await exportToZip(data, ideaTitle, exportOptions);
    } else {
      throw new Error("صيغة التصدير غير مدعومة");
    }
    
    console.log("=== Export process completed successfully ===");
    toast.success("تم تصدير الفكرة بنجاح");
  } catch (error) {
    console.error("Error in export process:", error);
    toast.error(error.message || "حدث خطأ أثناء تصدير الفكرة");
    throw error;
  }
};
