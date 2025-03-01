
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
    console.log("=== بدء عملية التصدير ===");
    console.log("معرف الفكرة:", ideaId);
    console.log("عنوان الفكرة:", ideaTitle);
    console.log("خيارات التصدير:", exportOptions);
    console.log("تنسيق التصدير:", exportFormat);

    // Fetch data based on selected options
    const data = await fetchIdeaData(ideaId, exportOptions);
    console.log("تم جلب البيانات بنجاح", { 
      ideaData: !!data.idea, 
      commentsCount: data.comments?.length || 0,
      votesCount: data.votes?.length || 0,
      hasDecision: !!data.decision
    });
    
    // Export data in the selected format
    if (exportFormat === "pdf") {
      console.log("بدء تصدير PDF...");
      await exportToPdf(data, ideaTitle, exportOptions);
    } else if (exportFormat === "text") {
      console.log("بدء تصدير النص...");
      exportToText(data, ideaTitle);
    } else if (exportFormat === "zip") {
      console.log("بدء تصدير الملف المضغوط...");
      await exportToZip(data, ideaTitle, exportOptions);
    } else {
      throw new Error("تنسيق تصدير غير مدعوم");
    }
    
    console.log("=== انتهت عملية التصدير بنجاح ===");
  } catch (error) {
    console.error("خطأ في عملية التصدير:", error);
    throw error;
  }
};
