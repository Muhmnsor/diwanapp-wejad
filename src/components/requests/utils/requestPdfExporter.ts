
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { formatDate } from "@/utils/dateUtils";

// Add Arabic font configuration
const configurePdfForArabic = (pdf: jsPDF) => {
  pdf.setFont("Helvetica");
  pdf.setR2L(true); // Enable right-to-left for Arabic text
  return pdf;
};

// Generate QR code for verification
const generateQRCode = async (requestId: string, baseUrl: string): Promise<string> => {
  try {
    const verificationUrl = `${baseUrl}/requests/verify/${requestId}`;
    return await QRCode.toDataURL(verificationUrl);
  } catch (error) {
    console.error("Error generating QR code:", error);
    return "";
  }
};

// Add request header info to PDF
const addRequestHeader = (
  pdf: jsPDF, 
  request: any, 
  requestType: any, 
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFontSize(18);
  pdf.text("تفاصيل الطلب", pageWidth / 2, startY, { align: "center" });
  
  // Add request info
  pdf.setFontSize(12);
  startY += 10;
  pdf.text(`رقم الطلب: ${request.id.substring(0, 8)}`, 15, startY);
  startY += 7;
  pdf.text(`عنوان الطلب: ${request.title}`, 15, startY);
  startY += 7;
  pdf.text(`نوع الطلب: ${requestType?.name || "غير محدد"}`, 15, startY);
  startY += 7;
  pdf.text(`الحالة: ${getStatusTranslation(request.status)}`, 15, startY);
  startY += 7;
  pdf.text(`تاريخ الإنشاء: ${formatDate(request.created_at)}`, 15, startY);
  if (request.updated_at) {
    startY += 7;
    pdf.text(`تاريخ آخر تحديث: ${formatDate(request.updated_at)}`, 15, startY);
  }
  
  // Draw separator line
  startY += 10;
  pdf.setLineWidth(0.5);
  pdf.line(15, startY, pageWidth - 15, startY);
  
  return startY + 10;
};

// Add form data section to PDF
const addFormDataSection = (
  pdf: jsPDF, 
  formData: Record<string, any>,
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  pdf.setFontSize(14);
  pdf.text("بيانات الطلب", 15, startY);
  startY += 10;
  
  // Form data
  pdf.setFontSize(11);
  
  if (formData && Object.keys(formData).length > 0) {
    Object.entries(formData).forEach(([key, value]) => {
      // Check page break if needed
      if (startY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        startY = 20;
      }
      
      pdf.text(`${key}: ${value !== null && value !== undefined ? String(value) : "-"}`, 15, startY);
      startY += 7;
    });
  } else {
    pdf.text("لا توجد بيانات إضافية للطلب", 15, startY);
    startY += 7;
  }
  
  // Draw separator line
  startY += 5;
  pdf.setLineWidth(0.5);
  pdf.line(15, startY, pageWidth - 15, startY);
  
  return startY + 10;
};

// Add approvals history section to PDF
const addApprovalsSection = (
  pdf: jsPDF,
  approvals: any[],
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  pdf.setFontSize(14);
  pdf.text("سجل الموافقات", 15, startY);
  startY += 10;
  
  if (approvals && approvals.length > 0) {
    // Table headers
    pdf.setFontSize(10);
    const headerY = startY;
    pdf.text("الخطوة", 15, headerY);
    pdf.text("المسؤول", 70, headerY);
    pdf.text("الحالة", 130, headerY);
    pdf.text("التاريخ", 160, headerY);
    
    // Draw header separator
    startY += 5;
    pdf.setLineWidth(0.3);
    pdf.line(15, startY, pageWidth - 15, startY);
    startY += 5;
    
    // Table rows
    pdf.setFontSize(9);
    approvals.forEach((approval, index) => {
      // Check page break if needed
      if (startY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        startY = 20;
        
        // Re-add table headers
        pdf.setFontSize(10);
        pdf.text("الخطوة", 15, startY);
        pdf.text("المسؤول", 70, startY);
        pdf.text("الحالة", 130, startY);
        pdf.text("التاريخ", 160, startY);
        startY += 5;
        pdf.setLineWidth(0.3);
        pdf.line(15, startY, pageWidth - 15, startY);
        startY += 5;
        pdf.setFontSize(9);
      }
      
      const stepName = approval.step?.step_name || "خطوة غير معروفة";
      const approverName = approval.approver?.display_name || approval.approver?.email || "-";
      const status = getApprovalStatusTranslation(approval.status);
      const date = approval.approved_at ? formatDate(approval.approved_at) : "-";
      
      pdf.text(stepName, 15, startY);
      pdf.text(approverName, 70, startY);
      pdf.text(status, 130, startY);
      pdf.text(date, 160, startY);
      
      startY += 7;
      
      // Add comment if available
      if (approval.comments) {
        pdf.text(`ملاحظات: ${approval.comments}`, 20, startY);
        startY += 7;
      }
      
      // Add row separator if not last row
      if (index < approvals.length - 1) {
        pdf.setLineWidth(0.1);
        pdf.line(15, startY, pageWidth - 15, startY);
        startY += 3;
      }
    });
  } else {
    pdf.setFontSize(11);
    pdf.text("لا توجد موافقات مسجلة لهذا الطلب", 15, startY);
    startY += 7;
  }
  
  // Draw section end separator
  startY += 5;
  pdf.setLineWidth(0.5);
  pdf.line(15, startY, pageWidth - 15, startY);
  
  return startY + 10;
};

// Add QR code and verification instructions
const addVerificationQR = async (
  pdf: jsPDF,
  qrCodeData: string,
  startY: number
): Promise<number> => {
  if (!qrCodeData) return startY;
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Check if need to add a new page
  if (startY > pdf.internal.pageSize.getHeight() - 70) {
    pdf.addPage();
    startY = 20;
  }
  
  // Section header
  pdf.setFontSize(14);
  pdf.text("التحقق من الطلب", pageWidth / 2, startY, { align: "center" });
  startY += 10;
  
  // Add QR code
  pdf.addImage(qrCodeData, "PNG", pageWidth / 2 - 30, startY, 60, 60);
  startY += 65;
  
  // Add verification instructions
  pdf.setFontSize(10);
  pdf.text("يمكن التحقق من صحة هذا الطلب عن طريق مسح رمز QR أعلاه", pageWidth / 2, startY, { align: "center" });
  
  return startY + 10;
};

// Add footer with timestamp and page numbers
const addFooter = (pdf: jsPDF): void => {
  const pageCount = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const now = new Date();
  const timestamp = `تم إنشاء هذا المستند بتاريخ ${formatDate(now.toISOString())}`;
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Add timestamp at bottom left
    pdf.setFontSize(8);
    pdf.text(timestamp, 15, pageHeight - 10);
    
    // Add page number at bottom right
    pdf.text(`صفحة ${i} من ${pageCount}`, pageWidth - 15, pageHeight - 10, { align: "right" });
  }
};

// Helper to translate request status to Arabic
const getStatusTranslation = (status: string): string => {
  switch (status) {
    case 'pending': return 'قيد الانتظار';
    case 'completed': return 'مكتمل';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوض';
    case 'in_progress': return 'قيد التنفيذ';
    case 'executed': return 'تم التنفيذ';
    case 'implementation_complete': return 'اكتمل التنفيذ';
    default: return status;
  }
};

// Helper to translate approval status to Arabic
const getApprovalStatusTranslation = (status: string): string => {
  switch (status) {
    case 'pending': return 'معلق';
    case 'approved': return 'تمت الموافقة';
    case 'rejected': return 'مرفوض';
    default: return status;
  }
};

// Main export function
export const exportRequestToPdf = async (data: any): Promise<void> => {
  const { request, requestType, approvals = [], attachments = [] } = data;
  
  if (!request) {
    toast.error("لا توجد بيانات كافية لتصدير الطلب");
    return;
  }
  
  try {
    toast.info("جاري إنشاء ملف PDF...");
    
    // Initialize PDF with RTL support
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });
    
    // Configure for Arabic
    configurePdfForArabic(pdf);
    
    // Generate QR code for verification
    const baseUrl = window.location.origin;
    const qrCodeData = await generateQRCode(request.id, baseUrl);
    
    // Start Y position for content
    let startY = 20;
    
    // Add request header information
    startY = addRequestHeader(pdf, request, requestType, startY);
    
    // Add form data
    startY = addFormDataSection(pdf, request.form_data, startY);
    
    // Add approvals section
    startY = addApprovalsSection(pdf, approvals, startY);
    
    // Add QR code for verification
    startY = await addVerificationQR(pdf, qrCodeData, startY);
    
    // Add footer with timestamp and page numbers
    addFooter(pdf);
    
    // Generate filename
    const fileName = `طلب_${request.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Save the PDF
    pdf.save(fileName);
    
    toast.success("تم تصدير الطلب بنجاح");
  } catch (error) {
    console.error("Error exporting request to PDF:", error);
    toast.error("حدث خطأ أثناء تصدير الطلب");
  }
};
