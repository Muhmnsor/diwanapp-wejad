
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestApproval, RequestWithApproval } from "../types/approvals";
import { useAuthStore } from "@/store/refactored-auth";

export const useIncomingRequests = () => {
  const { user } = useAuthStore();
  
  const fetchIncomingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching incoming requests for user:", user.id);
      
      const { data, error } = await supabase
        .from("request_approvals")
        .select(`
          id,
          request_id,
          step_id,
          status,
          request:requests(
            id,
            title,
            status,
            priority,
            created_at,
            current_step_id,
            requester_id,
            request_type_id,
            request_type:request_types(id, name)
          ),
          step:request_workflow_steps(id, step_name, step_type, approver_id)
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending");
      
      if (error) {
        console.error("Error fetching incoming requests:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        return [];
      }
      
      if (!data) {
        console.log("No data returned from incoming requests query");
        return [];
      }
      
      console.log("Raw response data for incoming requests:", JSON.stringify(data, null, 2));
      
      // Map the response to a more usable format
      const requests = data.map((item: RequestApproval) => {
        const requestData = item.request && item.request.length > 0 
          ? item.request[0] 
          : null;
          
        const stepData = item.step && item.step.length > 0 
          ? item.step[0] 
          : null;
          
        if (!requestData) {
          console.warn(`Skipping approval ${item.id} due to missing request data`);
          return null;
        }
        
        let requestType = null;
        if (requestData && requestData.request_type) {
          if (Array.isArray(requestData.request_type) && requestData.request_type.length > 0) {
            requestType = requestData.request_type[0];
          }
        }
        
        return {
          ...requestData,
          request_type: requestType,
          approval_id: item.id,
          step_id: item.step_id,
          step_name: stepData ? stepData.step_name : 'Unknown Step',
          step_type: stepData ? stepData.step_type : 'decision',
          requester_id: requestData.requester_id,
          requester: null // Initialize requester field
        };
      }).filter(Boolean) as RequestWithApproval[];
      
      // Add requester information
      if (requests.length > 0) {
        const requesterIds = requests
          .map(req => req.requester_id)
          .filter(Boolean);
          
        if (requesterIds.length > 0) {
          const { data: users } = await supabase
            .from("profiles")
            .select("id, display_name, email")
            .in("id", requesterIds);
            
          const userMap = Object.fromEntries(
            (users || []).map(user => [user.id, user])
          );
          
          requests.forEach(req => {
            if (req.requester_id && userMap[req.requester_id]) {
              req.requester = userMap[req.requester_id];
            }
          });
        }
      }
      
      console.log(`Fetched ${requests.length} incoming requests after processing`);
      return requests;
    } catch (error) {
      console.error("Error in fetchIncomingRequests:", error);
      return [];
    }
  };

  const { data: incomingRequests, isLoading: incomingLoading } = useQuery({
    queryKey: ["requests", "incoming"],
    queryFn: fetchIncomingRequests,
    enabled: !!user
  });

  return { incomingRequests, incomingLoading };
};
