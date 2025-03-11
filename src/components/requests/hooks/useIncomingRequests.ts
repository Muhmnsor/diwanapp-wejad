
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
      
      // Query pending approvals where current user is an approver
      const { data: approvals, error: approvalsError } = await supabase
        .from("request_approvals")
        .select(`
          id,
          request_id,
          status,
          step_id,
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
          )
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (approvalsError) {
        console.error("Error fetching incoming requests via approvals:", approvalsError);
        return [];
      }
      
      // Process the data
      const transformedRequests = (approvals || [])
        .filter(approval => approval.request) // Filter out any null requests
        .map(approval => {
          const request = Array.isArray(approval.request) 
            ? approval.request[0] 
            : approval.request;
          
          if (!request) return null;
          
          // Extract and normalize request_type data
          let requestType = null;
          if (request.request_type) {
            if (Array.isArray(request.request_type) && request.request_type.length > 0) {
              requestType = {
                id: request.request_type[0].id,
                name: request.request_type[0].name
              };
            } else if (typeof request.request_type === 'object') {
              requestType = request.request_type;
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
            step_id: approval.step_id,
            approval_id: approval.id,
            requester: null // Will be populated below
          };
        })
        .filter(Boolean); // Remove any null entries
      
      console.log(`Found ${transformedRequests.length} incoming requests via approvals`);
      
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
      
      // Fetch steps information if needed
      if (transformedRequests.length > 0) {
        const stepIds = transformedRequests
          .map(req => req.step_id)
          .filter(Boolean);
          
        if (stepIds.length > 0) {
          const { data: steps } = await supabase
            .from("request_workflow_steps")
            .select("id, step_name, step_type")
            .in("id", stepIds);
            
          const stepsMap = Object.fromEntries(
            (steps || []).map(step => [step.id, step])
          );
          
          transformedRequests.forEach(req => {
            if (req.step_id && stepsMap[req.step_id]) {
              req.step_name = stepsMap[req.step_id].step_name;
              req.step_type = stepsMap[req.step_id].step_type;
            }
          });
        }
      }
      
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
