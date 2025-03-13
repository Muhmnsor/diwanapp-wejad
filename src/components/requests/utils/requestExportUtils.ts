
import { supabase } from "@/integrations/supabase/client";
import { exportRequestToPdf } from "./requestPdfExporter";
import { toast } from "sonner";
import { loadFonts } from "@/utils/pdf/arabicUtils";

/**
 * Fetches enhanced request data for PDF export and records the export action
 */
export const fetchRequestExportData = async (requestId: string): Promise<any> => {
  try {
    console.log("Fetching request data for export:", requestId);
    
    // Get enhanced data for PDF export
    const { data, error } = await supabase
      .rpc('get_request_pdf_export_data', { p_request_id: requestId });
    
    if (error) {
      console.error("Supabase error fetching request data:", error);
      throw new Error(error.message);
    }
    
    if (!data) {
      console.error("No data returned for request:", requestId);
      throw new Error("لا توجد بيانات للطلب المطلوب");
    }
    
    console.log("Successfully retrieved request data:", data);
    
    // Record the export action (optional, only if you want to track exports)
    try {
      const userId = (await supabase.auth.getSession()).data.session?.user.id;
      if (userId) {
        const { data: logData, error: logError } = await supabase.rpc('record_request_pdf_export', {
          p_request_id: requestId,
          p_exported_by: userId
        });
        
        if (logError) {
          console.warn("Failed to record export action:", logError);
        } else {
          console.log("Export action recorded:", logData);
        }
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
    // Pre-load the Arabic fonts while we're fetching the data
    loadFonts().catch(err => console.error("Font preloading error:", err));
    
    // Fetch all needed data
    console.log("Starting data fetch for request:", requestId);
    const data = await fetchRequestExportData(requestId);
    
    if (!data.request) {
      console.error("Request data is missing in the response:", data);
      toast.error("تعذر العثور على بيانات الطلب");
      return;
    }
    
    console.log("Preparing to generate PDF for request:", data.request.id);
    
    // Export to PDF
    await exportRequestToPdf(data);
    console.log("PDF export completed successfully");
    
  } catch (error: any) {
    console.error("Error exporting request:", error);
    toast.error(`حدث خطأ أثناء تصدير الطلب: ${error.message || "خطأ غير معروف"}`);
    throw error; // Re-throw to allow the button component to handle it
  }
};
