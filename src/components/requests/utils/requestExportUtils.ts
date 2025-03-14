
import { supabase } from "@/integrations/supabase/client";
import { exportRequestToPdf } from "./requestPdfExporter";
import { toast } from "sonner";

/**
 * Fetches enhanced request data for PDF export and records the export action
 */
export const fetchRequestExportData = async (requestId: string): Promise<any> => {
  try {
    // Get enhanced data for PDF export
    const { data, error } = await supabase
      .rpc('get_request_pdf_export_data', { p_request_id: requestId });
    
    if (error) {
      console.error("Error fetching request data for export:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
      throw new Error("No data returned for the request");
    }
    
    // Record the export action (optional, only if you want to track exports)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (userId) {
        await supabase.rpc('record_request_pdf_export', {
          p_request_id: requestId,
          p_exported_by: userId
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
    toast.info("جاري تجهيز بيانات الطلب للتصدير...");
    
    // Fetch all needed data
    const data = await fetchRequestExportData(requestId);
    
    // Export to PDF
    await exportRequestToPdf(data);
    
  } catch (error: any) {
    console.error("Error exporting request:", error);
    toast.error(`حدث خطأ أثناء تصدير الطلب: ${error.message || "خطأ غير معروف"}`);
    throw error;
  }
};
