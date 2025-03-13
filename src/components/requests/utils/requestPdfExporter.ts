
import { toast } from "sonner";
import QRCode from "qrcode";
import { formatArabicDate } from "@/utils/dateUtils";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";

// Initialize pdfmake with virtual file system for fonts
(pdfMake as any).vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

// Register custom fonts for Arabic support
const fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf'
  },
  Amiri: {
    normal: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-regular.ttf',
    bold: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-bold.ttf',
    italics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-slanted.ttf',
    bolditalics: 'https://cdn.jsdelivr.net/npm/amiri-font@0.4.0/amiri-boldslanted.ttf'
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

// Helper to create the form data content for the PDF
const createFormDataContent = (formData: Record<string, any>) => {
  if (!formData || Object.keys(formData).length === 0) {
    return [{ text: "لا توجد بيانات إضافية للطلب", alignment: 'right' }];
  }

  const content: any[] = [];
  
  Object.entries(formData).forEach(([key, value]) => {
    const displayValue = value !== null && value !== undefined ? String(value) : "-";
    content.push({
      text: `${key}: ${displayValue}`,
      alignment: 'right',
      margin: [0, 5, 0, 0]
    });
  });
  
  return content;
};

// Helper to create a table for approvals
const createApprovalsTable = (approvals: any[]) => {
  if (!approvals || approvals.length === 0) {
    return [{ text: "لا توجد موافقات مسجلة لهذا الطلب", alignment: 'right' }];
  }

  // Create table headers
  const tableBody: TableCell[][] = [
    [
      { text: 'الخطوة', style: 'tableHeader', alignment: 'right' },
      { text: 'المسؤول', style: 'tableHeader', alignment: 'center' },
      { text: 'الحالة', style: 'tableHeader', alignment: 'center' },
      { text: 'التاريخ', style: 'tableHeader', alignment: 'center' }
    ]
  ];

  // Add rows for each approval
  approvals.forEach(approval => {
    const stepName = approval.step?.step_name || "خطوة غير معروفة";
    const approverName = approval.approver?.display_name || approval.approver?.email || "-";
    const status = getApprovalStatusTranslation(approval.status);
    const date = approval.approved_at ? formatArabicDate(approval.approved_at) : "-";
    
    const row: TableCell[] = [
      { text: stepName, alignment: 'right' },
      { text: approverName, alignment: 'center' },
      { text: status, alignment: 'center' },
      { text: date, alignment: 'center' }
    ];
    
    tableBody.push(row);
    
    // Add a row for comments if available
    if (approval.comments) {
      tableBody.push([
        { 
          text: `ملاحظات: ${approval.comments}`, 
          alignment: 'right',
          colSpan: 4,
          style: 'commentCell'
        },
        {}, {}, {}
      ]);
    }
  });

  return [
    {
      table: {
        headerRows: 1,
        widths: ['*', '*', 'auto', 'auto'],
        body: tableBody
      },
      layout: {
        fillColor: function(rowIndex: number) {
          return rowIndex === 0 ? '#f0f0f0' : null;
        }
      }
    }
  ];
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
    console.log("Starting PDF export with data:", {
      requestId: request.id,
      formData: request.form_data ? Object.keys(request.form_data).length : 0,
      approvalsCount: approvals.length
    });
    
    // Generate QR code for verification
    const baseUrl = window.location.origin;
    const qrCodeData = await generateQRCode(request.id, baseUrl);
    
    // Create a timestamp
    const timestamp = `تم إنشاء هذا المستند بتاريخ ${formatArabicDate(new Date().toISOString())}`;
    
    // Define the document
    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageOrientation: 'portrait',
      pageMargins: [40, 60, 40, 60],
      
      // RTL (Right-to-Left) for Arabic
      rtl: true, // Use rtl instead of rightToLeft
      
      // Default font settings
      defaultStyle: {
        font: 'Amiri',
        fontSize: 10,
        lineHeight: 1.5
      },
      
      // Document content
      content: [
        // Title
        {
          text: 'تفاصيل الطلب',
          style: 'header',
          alignment: 'center',
          margin: [0, 0, 0, 10]
        },
        
        // Request basic info
        {
          text: `رقم الطلب: ${request.id.substring(0, 8)}`,
          alignment: 'right',
          margin: [0, 5, 0, 0]
        },
        {
          text: `عنوان الطلب: ${request.title}`,
          alignment: 'right',
          margin: [0, 5, 0, 0]
        },
        {
          text: `نوع الطلب: ${requestType?.name || "غير محدد"}`,
          alignment: 'right',
          margin: [0, 5, 0, 0]
        },
        {
          text: `الحالة: ${getStatusTranslation(request.status)}`,
          alignment: 'right',
          margin: [0, 5, 0, 0]
        },
        {
          text: `تاريخ الإنشاء: ${formatArabicDate(request.created_at)}`,
          alignment: 'right',
          margin: [0, 5, 0, 0]
        },
        request.updated_at ? {
          text: `تاريخ آخر تحديث: ${formatArabicDate(request.updated_at)}`,
          alignment: 'right',
          margin: [0, 5, 0, 10]
        } : {},
        
        // Separator
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }],
          margin: [0, 10, 0, 10]
        },
        
        // Form data section
        {
          text: 'بيانات الطلب',
          style: 'subheader',
          alignment: 'right',
          margin: [0, 10, 0, 10]
        },
        ...createFormDataContent(request.form_data),
        
        // Separator
        {
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CCCCCC' }],
          margin: [0, 10, 0, 10]
        },
        
        // Approvals section
        {
          text: 'سجل الموافقات',
          style: 'subheader',
          alignment: 'right',
          margin: [0, 10, 0, 10]
        },
        ...createApprovalsTable(approvals),
        
        // Page break before QR
        { text: '', pageBreak: 'before' },
        
        // QR Code section
        {
          text: 'التحقق من الطلب',
          style: 'subheader',
          alignment: 'center',
          margin: [0, 10, 0, 10]
        },
        {
          image: qrCodeData,
          width: 150,
          alignment: 'center',
          margin: [0, 10, 0, 10]
        },
        {
          text: 'يمكن التحقق من صحة هذا الطلب عن طريق مسح رمز QR أعلاه',
          alignment: 'center',
          margin: [0, 10, 0, 0]
        }
      ],
      
      // Footer content
      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { text: `صفحة ${currentPage} من ${pageCount}`, alignment: 'left', margin: [40, 0, 0, 0] },
            { text: timestamp, alignment: 'right', margin: [0, 0, 40, 0] }
          ],
          margin: [40, 20, 40, 0]
        };
      },
      
      // Styles
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 11,
          color: 'black',
          fillColor: '#eeeeee'
        },
        commentCell: {
          fontSize: 9,
          italics: true,
          color: '#666666'
        }
      }
    };
    
    // Generate the filename
    const fileName = `طلب_${request.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    
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
