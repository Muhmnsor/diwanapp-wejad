
import { TableCell } from "pdfmake/interfaces";
import { formatArabicDate } from "@/utils/dateUtils";
import { getApprovalStatusTranslation } from "./translations";

/**
 * Creates form data content for the PDF
 */
export const createFormDataContent = (formData: Record<string, any>) => {
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

/**
 * Creates a table for approvals
 */
export const createApprovalsTable = (approvals: any[]) => {
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

