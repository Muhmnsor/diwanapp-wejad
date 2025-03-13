import { toast } from "sonner";
import QRCode from "qrcode";
import { formatDate, formatArabicDate } from "@/utils/dateUtils";
import pdfMake from "pdfmake/build/pdfmake";
import { getArabicFontDefinition, getArabicDocumentStyles, loadFonts } from "@/utils/pdf/arabicUtils";

// Define types for pdfmake since the direct import is not working
interface Content {
  text?: string;
  style?: string;
  margin?: number[];
  alignment?: string;
  columns?: any[];
  image?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  canvas?: any[];
  table?: {
    headerRows?: number;
    widths?: string[] | number[];
    body: any[][];
  };
  layout?: any;
  colSpan?: number;
}

interface StyleDictionary {
  [key: string]: {
    fontSize?: number;
    bold?: boolean;
    alignment?: string;
    margin?: number[];
    color?: string;
  };
}

interface TDocumentDefinitions {
  content: Content[];
  styles?: StyleDictionary;
  defaultStyle?: any;
  footer?: Function | any;
  pageSize?: string;
  pageOrientation?: string;
  pageMargins?: number[];
}

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

// Create request header section
const createRequestHeaderSection = (request: any, requestType: any): Content[] => {
  return [
    { text: 'تفاصيل الطلب', style: 'header' },
    { text: `رقم الطلب: ${request.id.substring(0, 8)}`, margin: [0, 5, 0, 0] },
    { text: `عنوان الطلب: ${request.title}`, margin: [0, 5, 0, 0] },
    { text: `نوع الطلب: ${requestType?.name || "غير محدد"}`, margin: [0, 5, 0, 0] },
    { text: `الحالة: ${getStatusTranslation(request.status)}`, margin: [0, 5, 0, 0] },
    { text: `تاريخ الإنشاء: ${formatArabicDate(request.created_at)}`, margin: [0, 5, 0, 0] },
    request.updated_at ? { text: `تاريخ آخر تحديث: ${formatArabicDate(request.updated_at)}`, margin: [0, 5, 0, 0] } : {},
    { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1 }], margin: [0, 10, 0, 10] }
  ];
};

// Create form data section
const createFormDataSection = (formData: Record<string, any>): Content[] => {
  const content: Content[] = [
    { text: 'بيانات الطلب', style: 'subheader' }
  ];
  
  if (formData && Object.keys(formData).length > 0) {
    Object.entries(formData).forEach(([key, value]) => {
      const displayValue = value !== null && value !== undefined ? String(value) : "-";
      content.push({ text: `${key}: ${displayValue}`, margin: [0, 3, 0, 0] });
    });
  } else {
    content.push({ text: "لا توجد بيانات إضافية للطلب", margin: [0, 3, 0, 0] });
  }
  
  content.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1 }], margin: [0, 10, 0, 10] });
  
  return content;
};

// Create approvals section
const createApprovalsSection = (approvals: any[]): Content[] => {
  const content: Content[] = [
    { text: 'سجل الموافقات', style: 'subheader' }
  ];
  
  if (approvals && approvals.length > 0) {
    // Create table for approvals
    const tableBody: any[][] = [
      [
        { text: 'الخطوة', style: 'tableHeader' },
        { text: 'المسؤول', style: 'tableHeader' },
        { text: 'الحالة', style: 'tableHeader' },
        { text: 'التاريخ', style: 'tableHeader' }
      ]
    ];
    
    approvals.forEach(approval => {
      const stepName = approval.step?.step_name || "خطوة غير معروفة";
      const approverName = approval.approver?.display_name || approval.approver?.email || "-";
      const status = getApprovalStatusTranslation(approval.status);
      const date = approval.approved_at ? formatArabicDate(approval.approved_at) : "-";
      
      tableBody.push([
        { text: stepName },
        { text: approverName },
        { text: status },
        { text: date }
      ]);
      
      // Add comment row if there is one
      if (approval.comments) {
        tableBody.push([
          { text: 'ملاحظات:', colSpan: 1 },
          { text: approval.comments, colSpan: 3 },
          {}, 
          {}
        ]);
      }
    });
    
    content.push({
      table: {
        headerRows: 1,
        widths: ['*', '*', '*', '*'],
        body: tableBody
      },
      layout: {
        hLineWidth: function(i: number, node: any) {
          return (i === 0 || i === node.table.body.length) ? 1 : 1;
        },
        vLineWidth: function() {
          return 1;
        }
      },
      margin: [0, 10, 0, 10]
    });
  } else {
    content.push({ text: "لا توجد موافقات مسجلة لهذا الطلب", margin: [0, 3, 0, 0] });
  }
  
  content.push({ canvas: [{ type: 'line', x1: 0, y1: 5, x2: 535, y2: 5, lineWidth: 1 }], margin: [0, 10, 0, 10] });
  
  return content;
};

// Create verification section with QR code
const createVerificationSection = (qrCodeData: string): Content[] => {
  if (!qrCodeData) return [];
  
  return [
    { text: 'التحقق من الطلب', style: 'subheader', alignment: 'center' },
    { image: qrCodeData, width: 100, alignment: 'center', margin: [0, 10, 0, 10] },
    { text: 'يمكن التحقق من صحة هذا الطلب عن طريق مسح رمز QR أعلاه', alignment: 'center', fontSize: 10 }
  ];
};

// Initialize pdfMake fonts
const initializePdfMake = async () => {
  try {
    // Load the fonts first
    await loadFonts();
    
    // Set the font definitions
    pdfMake.vfs = pdfMake.vfs || {};
    pdfMake.fonts = await getArabicFontDefinition();
    
    return true;
  } catch (error) {
    console.error("Error initializing PDF fonts:", error);
    return false;
  }
};

// Create document definition for pdfmake
const createDocumentDefinition = async (data: any): Promise<TDocumentDefinitions> => {
  const { request, requestType, approvals = [] } = data;
  
  // Generate QR code
  const baseUrl = window.location.origin;
  const qrCodeData = await generateQRCode(request.id, baseUrl);
  
  // Create document content
  const documentContent: Content[] = [
    ...createRequestHeaderSection(request, requestType),
    ...createFormDataSection(request.form_data),
    ...createApprovalsSection(approvals),
    ...createVerificationSection(qrCodeData)
  ];
  
  // Add footer
  const now = new Date();
  const styles = getArabicDocumentStyles();
  
  return {
    content: documentContent,
    footer: function(currentPage: number, pageCount: number) {
      return {
        columns: [
          { text: `صفحة ${currentPage} من ${pageCount}`, alignment: 'left', margin: [20, 0, 0, 0], fontSize: 8 },
          { text: `تم إنشاء هذا المستند بتاريخ ${formatArabicDate(now.toISOString())}`, alignment: 'right', margin: [0, 0, 20, 0], fontSize: 8 }
        ]
      };
    },
    defaultStyle: styles.defaultStyle,
    styles: styles as any
  };
};

// Main export function
export const exportRequestToPdf = async (data: any): Promise<void> => {
  const { request } = data;
  
  if (!request) {
    toast.error("لا توجد بيانات كافية لتصدير الطلب");
    return;
  }
  
  try {
    toast.info("جاري إنشاء ملف PDF...");
    
    // Initialize pdfMake with fonts
    const initialized = await initializePdfMake();
    if (!initialized) {
      throw new Error("فشل في تحميل خطوط PDF");
    }
    
    // Create document definition
    const docDefinition = await createDocumentDefinition(data);
    
    // Generate filename
    const fileName = `طلب_${request.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Download the PDF with extended error handling
    try {
      pdfMake.createPdf(docDefinition).download(fileName);
      toast.success("تم تصدير الطلب بنجاح");
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF");
      throw pdfError;
    }
  } catch (error) {
    console.error("Error exporting request to PDF:", error);
    toast.error("حدث خطأ أثناء تصدير الطلب");
  }
};
