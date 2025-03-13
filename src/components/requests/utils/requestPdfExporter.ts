
import { jsPDF } from "jspdf";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { formatDate } from "@/utils/dateUtils";
import { formatArabicDate } from "@/utils/dateUtils";
// Import for font support
import 'jspdf-autotable';

// Add Arabic font to jsPDF
const addArabicFontToPdf = async (pdf: jsPDF): Promise<jsPDF> => {
  try {
    // Load Amiri font which supports Arabic characters well
    const normalFont = await fetch('/fonts/Amiri-Regular.ttf').then(res => res.arrayBuffer());
    const boldFont = await fetch('/fonts/Amiri-Bold.ttf').then(res => res.arrayBuffer());
    
    // Add the fonts to the PDF document
    pdf.addFileToVFS('Amiri-Regular.ttf', normalFont);
    pdf.addFileToVFS('Amiri-Bold.ttf', boldFont);
    pdf.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');
    pdf.addFont('Amiri-Bold.ttf', 'Amiri', 'bold');
    
    // Set the default font
    pdf.setFont('Amiri');
    
    return pdf;
  } catch (error) {
    console.error("Error loading Arabic font:", error);
    // Fall back to Helvetica if font loading fails
    pdf.setFont("Helvetica");
    return pdf;
  }
};

// Configure PDF for Arabic text with RTL support
const configurePdfForArabic = async (pdf: jsPDF): Promise<jsPDF> => {
  try {
    // Set right-to-left mode for Arabic text
    pdf.setR2L(true);
    
    // Add Arabic font support
    await addArabicFontToPdf(pdf);
    
    return pdf;
  } catch (error) {
    console.error("Error configuring PDF for Arabic:", error);
    // Fallback to basic configuration
    pdf.setR2L(true);
    pdf.setFont("Helvetica");
    return pdf;
  }
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

// Add request header info to PDF with RTL support
const addRequestHeader = (
  pdf: jsPDF, 
  request: any, 
  requestType: any, 
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add title
  pdf.setFontSize(18);
  pdf.setFont('Amiri', 'bold');
  pdf.text("تفاصيل الطلب", pageWidth / 2, startY, { align: "center" });
  
  // Add request info
  pdf.setFontSize(12);
  pdf.setFont('Amiri', 'normal');
  startY += 10;
  pdf.text(`رقم الطلب: ${request.id.substring(0, 8)}`, pageWidth - 15, startY, { align: "right" });
  startY += 7;
  pdf.text(`عنوان الطلب: ${request.title}`, pageWidth - 15, startY, { align: "right" });
  startY += 7;
  pdf.text(`نوع الطلب: ${requestType?.name || "غير محدد"}`, pageWidth - 15, startY, { align: "right" });
  startY += 7;
  pdf.text(`الحالة: ${getStatusTranslation(request.status)}`, pageWidth - 15, startY, { align: "right" });
  startY += 7;
  pdf.text(`تاريخ الإنشاء: ${formatArabicDate(request.created_at)}`, pageWidth - 15, startY, { align: "right" });
  if (request.updated_at) {
    startY += 7;
    pdf.text(`تاريخ آخر تحديث: ${formatArabicDate(request.updated_at)}`, pageWidth - 15, startY, { align: "right" });
  }
  
  // Draw separator line
  startY += 10;
  pdf.setLineWidth(0.5);
  pdf.line(15, startY, pageWidth - 15, startY);
  
  return startY + 10;
};

// Add form data section to PDF with RTL support
const addFormDataSection = (
  pdf: jsPDF, 
  formData: Record<string, any>,
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  pdf.setFontSize(14);
  pdf.setFont('Amiri', 'bold');
  pdf.text("بيانات الطلب", pageWidth - 15, startY, { align: "right" });
  startY += 10;
  
  // Form data
  pdf.setFontSize(11);
  pdf.setFont('Amiri', 'normal');
  
  if (formData && Object.keys(formData).length > 0) {
    Object.entries(formData).forEach(([key, value]) => {
      // Check page break if needed
      if (startY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        startY = 20;
      }
      
      const displayValue = value !== null && value !== undefined ? String(value) : "-";
      pdf.text(`${key}: ${displayValue}`, pageWidth - 15, startY, { align: "right" });
      startY += 7;
    });
  } else {
    pdf.text("لا توجد بيانات إضافية للطلب", pageWidth - 15, startY, { align: "right" });
    startY += 7;
  }
  
  // Draw separator line
  startY += 5;
  pdf.setLineWidth(0.5);
  pdf.line(15, startY, pageWidth - 15, startY);
  
  return startY + 10;
};

// Add approvals history section to PDF with RTL support
const addApprovalsSection = (
  pdf: jsPDF,
  approvals: any[],
  startY: number
): number => {
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Section header
  pdf.setFontSize(14);
  pdf.setFont('Amiri', 'bold');
  pdf.text("سجل الموافقات", pageWidth - 15, startY, { align: "right" });
  startY += 10;
  
  if (approvals && approvals.length > 0) {
    // Table headers
    pdf.setFontSize(10);
    pdf.setFont('Amiri', 'bold');
    const headerY = startY;
    
    // Draw header texts (reversed for RTL)
    pdf.text("التاريخ", 40, headerY, { align: "center" });
    pdf.text("الحالة", 85, headerY, { align: "center" });
    pdf.text("المسؤول", 150, headerY, { align: "center" });
    pdf.text("الخطوة", pageWidth - 20, headerY, { align: "right" });
    
    // Draw header separator
    startY += 5;
    pdf.setLineWidth(0.3);
    pdf.line(15, startY, pageWidth - 15, startY);
    startY += 5;
    
    // Table rows
    pdf.setFontSize(9);
    pdf.setFont('Amiri', 'normal');
    approvals.forEach((approval, index) => {
      // Check page break if needed
      if (startY > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        startY = 20;
        
        // Re-add table headers on new page
        pdf.setFontSize(10);
        pdf.setFont('Amiri', 'bold');
        pdf.text("التاريخ", 40, startY, { align: "center" });
        pdf.text("الحالة", 85, startY, { align: "center" });
        pdf.text("المسؤول", 150, startY, { align: "center" });
        pdf.text("الخطوة", pageWidth - 20, startY, { align: "right" });
        
        startY += 5;
        pdf.setLineWidth(0.3);
        pdf.line(15, startY, pageWidth - 15, startY);
        startY += 5;
        pdf.setFontSize(9);
        pdf.setFont('Amiri', 'normal');
      }
      
      const stepName = approval.step?.step_name || "خطوة غير معروفة";
      const approverName = approval.approver?.display_name || approval.approver?.email || "-";
      const status = getApprovalStatusTranslation(approval.status);
      const date = approval.approved_at ? formatArabicDate(approval.approved_at) : "-";
      
      // Add row data (adjusted for RTL)
      pdf.text(date, 40, startY, { align: "center" });
      pdf.text(status, 85, startY, { align: "center" });
      pdf.text(approverName, 150, startY, { align: "center" });
      pdf.text(stepName, pageWidth - 20, startY, { align: "right" });
      
      startY += 7;
      
      // Add comment if available
      if (approval.comments) {
        pdf.text(`ملاحظات: ${approval.comments}`, pageWidth - 20, startY, { align: "right" });
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
    pdf.setFont('Amiri', 'normal');
    pdf.text("لا توجد موافقات مسجلة لهذا الطلب", pageWidth - 15, startY, { align: "right" });
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
  pdf.setFont('Amiri', 'bold');
  pdf.text("التحقق من الطلب", pageWidth / 2, startY, { align: "center" });
  startY += 10;
  
  // Add QR code
  pdf.addImage(qrCodeData, "PNG", pageWidth / 2 - 30, startY, 60, 60);
  startY += 65;
  
  // Add verification instructions
  pdf.setFontSize(10);
  pdf.setFont('Amiri', 'normal');
  pdf.text("يمكن التحقق من صحة هذا الطلب عن طريق مسح رمز QR أعلاه", pageWidth / 2, startY, { align: "center" });
  
  return startY + 10;
};

// Add footer with timestamp and page numbers
const addFooter = (pdf: jsPDF): void => {
  const pageCount = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  const now = new Date();
  const timestamp = `تم إنشاء هذا المستند بتاريخ ${formatArabicDate(now.toISOString())}`;
  
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    
    // Add timestamp at bottom left (displayed on right due to RTL)
    pdf.setFontSize(8);
    pdf.setFont('Amiri', 'normal');
    pdf.text(timestamp, 15, pageHeight - 10);
    
    // Add page number at bottom right (displayed on left due to RTL)
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
      format: "a4",
      putOnlyUsedFonts: true
    });
    
    // Configure for Arabic with font support
    await configurePdfForArabic(pdf);
    
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
