
import { supabase } from "@/integrations/supabase/client";
import { exportRequestToPdf } from "./requestPdfExporter";
import { toast } from "sonner";

/**
 * Fetches enhanced request data for PDF export and records the export action
 */
export const fetchRequestExportData = async (requestId: string): Promise<any> => {
  try {
    // Show toast to indicate data fetching has started
    toast.info("جاري جلب بيانات الطلب...", { id: "fetch-request-data" });
    
    console.log("Fetching export data for request:", requestId);
    
    // Get enhanced data for PDF export
    const { data, error } = await supabase
      .rpc('get_request_pdf_export_data', { p_request_id: requestId });
    
    if (error) {
      console.error("Error fetching request data for export:", error);
      toast.error("خطأ في جلب بيانات الطلب", { id: "fetch-request-data" });
      throw new Error(error.message);
    }
    
    if (!data) {
      toast.error("لا توجد بيانات للطلب المطلوب", { id: "fetch-request-data" });
      throw new Error("لا توجد بيانات للطلب المطلوب");
    }
    
    // Log successful data retrieval
    console.log("Successfully fetched request export data:", {
      requestId,
      hasRequestData: !!data.request,
      approvalsCount: data.approvals?.length || 0
    });
    
    toast.success("تم جلب البيانات بنجاح", { id: "fetch-request-data" });
    
    // Record the export action (optional, only if you want to track exports)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (userId) {
        await supabase.rpc('record_request_pdf_export', {
          p_request_id: requestId,
          p_exported_by: userId
        });
        console.log("Export action recorded for request:", requestId);
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
    console.log("Starting export process for request:", requestId);
    
    // Fetch all needed data
    const data = await fetchRequestExportData(requestId);
    
    if (!data.request) {
      toast.error("تعذر العثور على بيانات الطلب");
      return;
    }
    
    console.log("Request data fetched, proceeding to PDF generation");
    
    // Export to PDF
    await exportRequestToPdf(data);
    
  } catch (error: any) {
    console.error("Error exporting request:", error);
    toast.error(`حدث خطأ أثناء تصدير الطلب: ${error.message || "خطأ غير معروف"}`);
  }
};
