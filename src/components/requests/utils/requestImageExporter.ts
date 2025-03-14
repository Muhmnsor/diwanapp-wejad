
import html2canvas from "html2canvas";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "sonner";

const createTemporaryContainer = (requestData: any): HTMLElement => {
  // Create a container for the document
  const container = document.createElement('div');
  container.id = 'request-export-container';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.padding = '40px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.direction = 'rtl';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1000';
  document.body.appendChild(container);

  // Add content to the container
  container.innerHTML = generateRequestDocumentHTML(requestData);
  
  return container;
};

const generateRequestDocumentHTML = (data: any): string => {
  const { request, request_type, requester, approvals = [] } = data;
  
  if (!request) return '<div>لا توجد بيانات كافية</div>';
  
  const statusTranslation = {
    'pending': 'قيد الانتظار',
    'approved': 'تمت الموافقة',
    'completed': 'مكتمل',
    'rejected': 'مرفوض',
    'in_progress': 'قيد التنفيذ',
    'executed': 'تم التنفيذ',
    'implementation_complete': 'اكتمل التنفيذ'
  };
  
  const priorityTranslation = {
    'low': 'منخفضة',
    'medium': 'متوسطة',
    'high': 'عالية',
    'urgent': 'عاجلة'
  };
  
  const approvalStatusTranslation = {
    'pending': 'معلق',
    'approved': 'تمت الموافقة',
    'rejected': 'مرفوض'
  };
  
  // Header
  let html = `
    <div style="border-bottom: 2px solid #333; margin-bottom: 20px; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
      <h1 style="font-size: 24px; color: #333; margin: 0;">وثيقة طلب: ${request.title}</h1>
      <div style="color: #666; font-size: 14px;">تاريخ الإنشاء: ${formatDate(request.created_at)}</div>
    </div>
  `;
  
  // Request Info
  html += `
    <div style="margin-bottom: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
      <h2 style="font-size: 18px; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px;">معلومات الطلب</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <div style="margin-bottom: 8px;"><strong>رقم الطلب:</strong> ${request.id.substring(0, 8)}</div>
          <div style="margin-bottom: 8px;"><strong>الحالة:</strong> <span style="background-color: #e6f7ff; padding: 2px 8px; border-radius: 4px; font-size: 14px;">${statusTranslation[request.status] || request.status}</span></div>
          <div style="margin-bottom: 8px;"><strong>مقدم الطلب:</strong> ${requester?.display_name || requester?.email || "غير معروف"}</div>
        </div>
        <div>
          <div style="margin-bottom: 8px;"><strong>نوع الطلب:</strong> ${request_type?.name || "غير محدد"}</div>
          <div style="margin-bottom: 8px;"><strong>الأولوية:</strong> <span style="background-color: #fff7e6; padding: 2px 8px; border-radius: 4px; font-size: 14px;">${priorityTranslation[request.priority] || request.priority}</span></div>
          <div style="margin-bottom: 8px;"><strong>تاريخ آخر تحديث:</strong> ${formatDate(request.updated_at) || "لا يوجد"}</div>
        </div>
      </div>
    </div>
  `;
  
  // Request Form Data
  if (request.form_data && Object.keys(request.form_data).length > 0) {
    html += `
      <div style="margin-bottom: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
        <h2 style="font-size: 18px; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px;">بيانات الطلب</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
    `;
    
    Object.entries(request.form_data).forEach(([key, value]) => {
      html += `
        <div style="margin-bottom: 8px;"><strong>${key}:</strong> ${value !== null && value !== undefined ? String(value) : "-"}</div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  }
  
  // Approvals
  if (approvals && approvals.length > 0) {
    html += `
      <div style="margin-bottom: 30px; background-color: #f9f9f9; padding: 15px; border-radius: 8px;">
        <h2 style="font-size: 18px; margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 15px;">الموافقات والإجراءات</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #eee;">
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">الخطوة</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">المعتمد</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">الحالة</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">التاريخ</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    approvals.forEach((approval) => {
      const stepName = approval.step?.step_name || "خطوة غير معروفة";
      const approverName = approval.approver?.display_name || approval.approver?.email || "-";
      const status = approvalStatusTranslation[approval.status] || approval.status;
      const date = approval.approved_at ? formatDate(approval.approved_at) : "-";
      
      html += `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 8px;">${stepName}</td>
          <td style="padding: 8px;">${approverName}</td>
          <td style="padding: 8px;">
            <span style="background-color: ${
              approval.status === 'approved' ? '#e6f7ff' : 
              approval.status === 'rejected' ? '#fff1f0' : '#f9f9f9'
            }; padding: 2px 8px; border-radius: 4px;">${status}</span>
          </td>
          <td style="padding: 8px;">${date}</td>
        </tr>
      `;
      
      if (approval.comments) {
        html += `
          <tr style="border-bottom: 1px solid #eee; background-color: #fafafa;">
            <td colspan="4" style="padding: 8px;">
              <strong>ملاحظات:</strong> ${approval.comments}
            </td>
          </tr>
        `;
      }
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  // Footer with watermark/verification
  html += `
    <div style="margin-top: 40px; border-top: 1px solid #ddd; padding-top: 15px; display: flex; justify-content: space-between; font-size: 12px; color: #666;">
      <div>وثيقة إلكترونية صادرة بتاريخ ${formatDate(new Date().toISOString())}</div>
      <div>يمكن التحقق من صحة هذه الوثيقة عبر رقم الطلب</div>
    </div>
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; pointer-events: none; opacity: 0.04; transform: rotate(-45deg); font-size: 120px; color: #000;">
      وثيقة رسمية
    </div>
  `;
  
  return html;
};

/**
 * Exports a request summary as a high-quality image document
 * @param requestData The data from the API for the request
 * @returns Promise resolving to true if successful
 */
export const exportRequestToImage = async (requestData: any): Promise<boolean> => {
  try {
    toast.info("جاري إنشاء وثيقة الطلب...");
    
    // Generate filename
    const fileName = `طلب_${requestData.request.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
    
    // Create the temporary container
    const container = createTemporaryContainer(requestData);
    
    // Wait for fonts and images to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      // Create canvas with high quality settings
      const canvas = await html2canvas(container, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        foreignObjectRendering: false // Better support for Arabic
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = fileName;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم تصدير وثيقة الطلب بنجاح");
      return true;
    } finally {
      // Always clean up the temporary container
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  } catch (error) {
    console.error("Error exporting request to image:", error);
    toast.error("حدث خطأ أثناء تصدير وثيقة الطلب");
    return false;
  }
};
