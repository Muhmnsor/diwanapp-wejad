
import { toast } from "sonner";
import * as pdfMake from "pdfmake/build/pdfmake";
import { RequestPdfData } from "./pdf-export/types";
import { pdfFonts } from "./pdf-export/fonts";
import { generateQRCode } from "./pdf-export/qrcode";
import { buildDocumentDefinition } from "./pdf-export/document-definition";

// Register the fonts with pdfMake
pdfMake.fonts = pdfFonts;

/**
 * Main export function to generate and download a PDF for a request
 */
export const exportRequestToPdf = async (data: RequestPdfData): Promise<void> => {
  const { request } = data;
  
  if (!request) {
    toast.error("لا توجد بيانات كافية لتصدير الطلب");
    return;
  }
  
  try {
    toast.info("جاري إنشاء ملف PDF...");
    console.log("Starting PDF export with data:", {
      requestId: request.id,
      formData: request.form_data ? Object.keys(request.form_data).length : 0,
      approvalsCount: data.approvals?.length || 0
    });
    
    // Generate QR code for verification
    const baseUrl = window.location.origin;
    const qrCodeData = await generateQRCode(request.id, baseUrl);
    
    // Generate the filename
    const fileName = `طلب_${request.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Build the document definition
    const docDefinition = buildDocumentDefinition(data, qrCodeData);
    
    // Add RTL support - not directly in docDefinition as it's not in the type definition
    // but pdfMake supports it as a runtime option
    (docDefinition as any).rtl = true;
    
    // Create and download the PDF
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      
      console.log("PDF created, initiating download...");
      toast.info("جاري تنزيل الملف...");
      
      pdfDoc.download(fileName, () => {
        console.log("PDF download complete");
        toast.success("تم تصدير الطلب بنجاح");
      });
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
      toast.error("فشل إنشاء ملف PDF. الرجاء المحاولة مرة أخرى");
    }
  } catch (error) {
    console.error("Error in exportRequestToPdf:", error);
    toast.error("حدث خطأ أثناء تصدير الطلب");
  }
};
