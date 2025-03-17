
import { supabase } from "@/integrations/supabase/client";

// Update a request after approval
export const updateRequestAfterApproval = async (requestId: string, stepId: string, metadata?: any) => {
  try {
    console.log(`Updating request ${requestId} after approval of step ${stepId}`);
    
    // Call the updated function that uses 'approved' status
    const { data, error } = await supabase.rpc('update_request_after_approval', {
      p_request_id: requestId,
      p_step_id: stepId
    });
    
    if (error) {
      console.error("Error updating request after approval:", error);
      throw new Error(`حدث خطأ أثناء تحديث حالة الطلب: ${error.message}`);
    }
    
    console.log("Request successfully updated after approval:", data);
    return data;
  } catch (error) {
    console.error("Exception in updateRequestAfterApproval:", error);
    throw error;
  }
};
