
import { TDocumentDefinitions } from "pdfmake/interfaces";
import { formatArabicDate } from "@/utils/dateUtils";
import { createApprovalsTable, createFormDataContent } from "./content-builders";
import { pdfFonts } from "./fonts";
import { getStatusTranslation } from "./translations";
import { RequestPdfData } from "./types";

/**
 * Builds the document definition for the PDF
 */
export const buildDocumentDefinition = (
  data: RequestPdfData, 
  qrCodeData: string
): TDocumentDefinitions => {
  const { request, requestType, approvals = [] } = data;
  
  // Create a timestamp
  const timestamp = `تم إنشاء هذا المستند بتاريخ ${formatArabicDate(new Date().toISOString())}`;
  
  return {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [40, 60, 40, 60],
    
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
};

