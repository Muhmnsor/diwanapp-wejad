
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { 
  generateIdeaTextContent, 
  generateCommentsTextContent, 
  generateVotesTextContent, 
  generateDecisionTextContent,
  sanitizeFileName
} from "../utils/textUtils";

/**
 * Export idea data as a PDF file
 */
export const exportToPdf = async (data: any, ideaTitle: string, exportOptions: string[]) => {
  try {
    console.log("Exporting idea to PDF format...");
    
    // تحميل خط دعم اللغة العربية
    // نحتاج إلى تضمين خط عربي
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });
    
    // إضافة دعم اللغة العربية
    doc.setR2L(true);
    
    // استخدام خط افتراضي
    doc.setFont("helvetica");
    doc.setFontSize(14);
    
    // إعداد المتغيرات
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const lineHeight = 10;
    let yPosition = 20;
    
    // إضافة العنوان
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 128); // لون أزرق غامق
    const titleText = `فكرة: ${ideaTitle}`;
    doc.text(titleText, pageWidth - margin, yPosition, { align: "right" });
    yPosition += lineHeight * 2;
    
    // إعادة تعيين لون النص والخط للمحتوى
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // إضافة المحتوى مع معالجة النص العربي
    const addMultiLineText = (text: string) => {
      // تقسيم النص إلى أسطر مناسبة لعرض الصفحة
      const textLines = doc.splitTextToSize(text, pageWidth - (margin * 2));
      
      // التحقق مما إذا كان هناك حاجة لصفحة جديدة
      if (yPosition + (textLines.length * lineHeight) > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      // كتابة النص
      doc.text(textLines, pageWidth - margin, yPosition, { align: "right" });
      yPosition += textLines.length * lineHeight;
    };
    
    // إضافة بيانات الفكرة الأساسية
    const ideaContent = generateIdeaTextContent(data.idea);
    addMultiLineText(ideaContent);
    
    // إضافة التعليقات إذا تم تحديدها
    if (exportOptions.includes("comments") && data.comments) {
      yPosition += lineHeight;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128);
      doc.text("المناقشات", pageWidth - margin, yPosition, { align: "right" });
      yPosition += lineHeight * 1.5;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const commentsContent = generateCommentsTextContent(data.comments);
      addMultiLineText(commentsContent);
    }
    
    // إضافة التصويتات إذا تم تحديدها
    if (exportOptions.includes("votes") && data.votes) {
      yPosition += lineHeight;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128);
      doc.text("التصويتات", pageWidth - margin, yPosition, { align: "right" });
      yPosition += lineHeight * 1.5;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const votesContent = generateVotesTextContent(data.votes);
      addMultiLineText(votesContent);
    }
    
    // إضافة القرار إذا تم تحديده
    if (exportOptions.includes("decision") && data.decision) {
      yPosition += lineHeight;
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 128);
      doc.text("القرار", pageWidth - margin, yPosition, { align: "right" });
      yPosition += lineHeight * 1.5;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      const decisionContent = generateDecisionTextContent(data.decision);
      addMultiLineText(decisionContent);
    }
    
    // إضافة تاريخ التصدير في أسفل الصفحة الأخيرة
    const dateText = `تم التصدير بتاريخ: ${new Date().toLocaleDateString('ar')}`;
    const lastPageY = doc.internal.pageSize.getHeight() - 10;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128); // لون رمادي
    doc.text(dateText, pageWidth - margin, lastPageY, { align: "right" });
    
    // حفظ الملف
    const fileName = sanitizeFileName(`فكرة-${ideaTitle}.pdf`);
    doc.save(fileName);
    
    console.log("PDF created and downloaded successfully!");
    return true;
  } catch (error) {
    console.error("Error creating PDF:", error);
    toast.error("حدث خطأ أثناء إنشاء ملف PDF");
    
    // في حالة الفشل، نستخدم التصدير النصي كبديل
    console.log("Falling back to text export...");
    const { exportToText } = await import("./exportText");
    exportToText(data, ideaTitle);
    return false;
  }
};
