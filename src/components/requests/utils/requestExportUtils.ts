
import { supabase } from "@/integrations/supabase/client";
import { exportRequestToPdf } from "./enhancedArabicPdfExporter";
import { toast } from "sonner";

/**
 * Fetches enhanced request data for PDF export and records the export action
 */
export const fetchRequestExportData = async (requestId: string): Promise<any> => {
  try {
    // Show loading toast
    toast.info("جاري تحميل بيانات الطلب...");
    
    // Get enhanced data for PDF export
    const { data, error } = await supabase
      .rpc('get_request_pdf_export_data', { p_request_id: requestId });
    
    if (error) {
      console.error("Error fetching request data for export:", error);
      toast.error(`خطأ في تحميل بيانات الطلب: ${error.message}`);
      throw new Error(error.message);
    }
    
    if (!data) {
      toast.error("لا توجد بيانات للطلب المطلوب");
      throw new Error("لا توجد بيانات للطلب المطلوب");
    }

    // Check if the response contains an error field (from our SQL function exception handling)
    if (data.error) {
      console.error("SQL function returned an error:", data.error, data.detail);
      toast.error(`خطأ في إعداد بيانات الطلب: ${data.error}`);
      throw new Error(data.detail || data.error);
    }
    
    // Log data for debugging
    console.log("PDF export data fetched successfully:", {
      request: data.request ? "✅" : "❌",
      request_type: data.request_type ? "✅" : "❌",
      requester: data.requester ? "✅" : "❌",
      approvals: Array.isArray(data.approvals) ? `✅ (${data.approvals.length} items)` : "❌",
      attachments: Array.isArray(data.attachments) ? `✅ (${data.attachments.length} items)` : "❌"
    });
    
    // Record the export action (optional, only if you want to track exports)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (userId) {
        await supabase.from('request_export_logs').insert({
          request_id: requestId,
          exported_by: userId,
          export_type: 'pdf'
        });
      }
    } catch (recordError) {
      // Log but don't block the export if recording fails
      console.error("Error recording export action:", recordError);
    }
    
    return data;
  } catch (error) {
    console.error("Error in fetchRequestExportData:", error);
    throw error;
  }
};

/**
 * Performs the full export process from fetching data to generating PDF
 */
export const exportRequestWithEnhancedData = async (requestId: string): Promise<void> => {
  try {
    // Fetch all needed data
    const data = await fetchRequestExportData(requestId);
    
    if (!data.request) {
      toast.error("تعذر العثور على بيانات الطلب");
      return;
    }
    
    // Export to PDF using the enhanced Arabic PDF exporter
    await exportRequestToPdf(data);
    
  } catch (error: any) {
    console.error("Error exporting request:", error);
    toast.error(`حدث خطأ أثناء تصدير الطلب: ${error.message || "خطأ غير معروف"}`);
  }
};
