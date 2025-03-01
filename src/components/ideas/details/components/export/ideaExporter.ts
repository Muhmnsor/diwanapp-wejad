
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
      hasDecision: !!data.decision,
      ideaStatus: data.idea?.status,
      ideaCreatedAt: data.idea?.created_at,
    });
    
    // تحقق من بنية البيانات للملفات المرفقة
    if (data.idea && data.idea.supporting_files) {
      console.log("معلومات الملفات المرفقة:", {
        supportingFilesCount: data.idea.supporting_files.length,
        fileDetails: data.idea.supporting_files.map(file => ({
          name: file.name,
          filePath: file.file_path,
          hasValidPath: !!file.file_path,
        }))
      });
    }
    
    // Export data in the selected format
    if (exportFormat === "pdf") {
      console.log("بدء تصدير PDF...");
      await exportToPdf(data, ideaTitle, exportOptions);
    } else if (exportFormat === "text") {
      console.log("بدء تصدير النص...");
      exportToText(data, ideaTitle);
    } else if (exportFormat === "zip") {
      console.log("بدء تصدير الملف المضغوط...");
      
      // طباعة المزيد من التفاصيل للتنقيح
      console.log("بيانات للتضمين في ZIP:", {
        hasIdea: !!data.idea,
        ideaId: data.idea?.id,
        hasComments: !!(data.comments && data.comments.length > 0),
        hasVotes: !!(data.votes && data.votes.length > 0),
        hasDecision: !!data.decision,
        hasSupportingFiles: !!(data.idea?.supporting_files && data.idea.supporting_files.length > 0),
        downloadFiles: exportOptions.includes("download_files"),
        supportingFilesCount: data.idea?.supporting_files?.length || 0,
        browser: window.navigator.userAgent,
      });
      
      try {
        console.time("zip-export-time");
        await exportToZip(data, ideaTitle, exportOptions);
        console.timeEnd("zip-export-time");
        console.log("تم تصدير الملف المضغوط بنجاح");
      } catch (zipError) {
        console.error("خطأ خلال عملية تصدير ZIP:", zipError);
        console.error("تفاصيل الخطأ:", {
          message: zipError instanceof Error ? zipError.message : String(zipError),
          stack: zipError instanceof Error ? zipError.stack : "No stack trace available"
        });
        throw new Error(`فشل إنشاء ملف ZIP: ${zipError instanceof Error ? zipError.message : String(zipError)}`);
      }
    } else {
      throw new Error("تنسيق تصدير غير مدعوم");
    }
    
    console.log("=== انتهت عملية التصدير بنجاح ===");
  } catch (error) {
    console.error("خطأ في عملية التصدير:", error);
    console.error("تفاصيل الخطأ:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace available"
    });
    throw error;
  }
};
