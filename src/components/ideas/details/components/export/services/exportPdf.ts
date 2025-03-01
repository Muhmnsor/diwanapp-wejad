
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
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
    
    // إنشاء عنصر HTML مؤقت لإنشاء التصدير
    const tempElement = document.createElement('div');
    tempElement.dir = 'rtl';
    tempElement.style.width = '595px'; // حجم A4 بالبكسل
    tempElement.style.padding = '40px';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    
    // إنشاء نمط للمحتوى
    tempElement.innerHTML = `
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #000080; font-size: 20px; margin-bottom: 20px; }
        h2 { color: #000080; font-size: 16px; margin-top: 20px; margin-bottom: 10px; }
        p { margin: 8px 0; }
        .section { margin-bottom: 20px; }
        .footer { color: #808080; font-size: 12px; margin-top: 30px; text-align: center; }
      </style>
      
      <h1>فكرة: ${ideaTitle}</h1>
      <div class="section">
        ${generateIdeaTextContent(data.idea).replace(/\n/g, '<br>')}
      </div>
    `;
    
    // إضافة التعليقات إذا تم تحديدها
    if (exportOptions.includes("comments") && data.comments) {
      tempElement.innerHTML += `
        <h2>المناقشات</h2>
        <div class="section">
          ${generateCommentsTextContent(data.comments).replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // إضافة التصويتات إذا تم تحديدها
    if (exportOptions.includes("votes") && data.votes) {
      tempElement.innerHTML += `
        <h2>التصويتات</h2>
        <div class="section">
          ${generateVotesTextContent(data.votes).replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // إضافة القرار إذا تم تحديده
    if (exportOptions.includes("decision") && data.decision) {
      tempElement.innerHTML += `
        <h2>القرار</h2>
        <div class="section">
          ${generateDecisionTextContent(data.decision).replace(/\n/g, '<br>')}
        </div>
      `;
    }
    
    // إضافة تاريخ التصدير في أسفل الصفحة
    tempElement.innerHTML += `
      <div class="footer">
        تم التصدير بتاريخ: ${new Date().toLocaleDateString('ar')}
      </div>
    `;
    
    // إضافة العنصر المؤقت إلى المستند
    document.body.appendChild(tempElement);
    
    try {
      console.log("Creating PDF from HTML content...");
      
      // تحويل HTML إلى صورة باستخدام html2canvas
      const canvas = await html2canvas(tempElement, {
        scale: 2, // جودة أعلى
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // إنشاء ملف PDF من الصورة
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // تحويل Canvas إلى صورة
      const imgData = canvas.toDataURL('image/png');
      
      // إضافة الصورة إلى PDF مع الحفاظ على نسبة العرض إلى الارتفاع
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // إذا كان المحتوى أطول من صفحة واحدة
      if (imgHeight * ratio > pdfHeight) {
        let pageCount = Math.ceil((imgHeight * ratio) / pdfHeight);
        
        // بالنسبة للصفحات الإضافية
        for (let i = 1; i < pageCount; i++) {
          pdf.addPage();
          pdf.addImage(
            imgData, 
            'PNG', 
            imgX, 
            -(i * pdfHeight), 
            imgWidth * ratio, 
            imgHeight * ratio
          );
        }
      }
      
      // حفظ الملف
      const fileName = sanitizeFileName(`فكرة-${ideaTitle}.pdf`);
      pdf.save(fileName);
      
      console.log("PDF created and downloaded successfully!");
      
      // إزالة العنصر المؤقت من المستند
      document.body.removeChild(tempElement);
      
      return true;
    } catch (renderError) {
      console.error("Error rendering PDF:", renderError);
      // إزالة العنصر المؤقت في حالة الخطأ
      document.body.removeChild(tempElement);
      throw renderError;
    }
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
