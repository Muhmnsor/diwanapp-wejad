
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { RequestWithApproval } from "../types/approvals";
import { useAuthStore } from "@/store/refactored-auth";

export const useIncomingRequests = () => {
  const { user } = useAuthStore();
  
  const fetchIncomingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching incoming requests for user:", user.id);
      
      // Query through request_approvals to find requests assigned to this user
      const { data: approvals, error: approvalsError } = await supabase
        .from("request_approvals")
        .select(`
          id,
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
          step:request_workflow_steps(
            id,
            step_name,
            step_type
          )
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending");
      
      if (approvalsError) {
        console.error("Error fetching approvals:", approvalsError);
        return [];
      }
      
      console.log("Raw approvals data:", approvals);
      
      if (!approvals || approvals.length === 0) {
        console.log("No pending approvals found for user:", user.id);
        return [];
      }
      
      // Transform the data into the expected format
      const transformedRequests = approvals
        .filter(approval => approval.request && Array.isArray(approval.request) && approval.request.length > 0)
        .map(approval => {
          const request = approval.request[0];
          
          // Handle the step data properly - it can be an array or an object
          let step = null;
          if (approval.step) {
            step = Array.isArray(approval.step) && approval.step.length > 0 
              ? approval.step[0] 
              : approval.step;
          }
          
          // Extract request_type - it can be an array or an object
          let requestType = null;
          if (request.request_type) {
            const requestTypeData = Array.isArray(request.request_type) && request.request_type.length > 0 
              ? request.request_type[0] 
              : request.request_type;
              
            if (requestTypeData) {
              requestType = {
                id: requestTypeData.id,
                name: requestTypeData.name
              };
            }
          }
          
          return {
            id: request.id,
            title: request.title,
            status: request.status,
            priority: request.priority,
            created_at: request.created_at,
            current_step_id: request.current_step_id,
            requester_id: request.requester_id,
            request_type_id: request.request_type_id,
            request_type: requestType,
            step_id: step?.id || null,
            step_name: step?.step_name || null,
            step_type: step?.step_type || null,
            approval_id: approval.id,
            requester: null // Will be populated below
          };
        });
      
      console.log(`Transformed ${transformedRequests.length} requests`, transformedRequests);
      
      // Add requester information
      if (transformedRequests.length > 0) {
        const requesterIds = transformedRequests
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
          
          transformedRequests.forEach(req => {
            if (req.requester_id && userMap[req.requester_id]) {
              req.requester = userMap[req.requester_id];
            }
          });
        }
      }
      
      console.log("Final requests to return:", transformedRequests);
      
      // Cast the result to ensure TypeScript compatibility
      return transformedRequests as RequestWithApproval[];
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
