
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
      
      // Fetch pending approvals where the current user is an approver
      // Using a simpler query structure to avoid recursive issues
      const { data: approvals, error } = await supabase
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
          ),
          step:request_workflow_steps(
            id,
            step_name,
            step_type
          )
        `)
        .eq("approver_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching approvals:", error);
        throw error;
      }
      
      console.log(`Found ${approvals?.length || 0} pending approvals`);
      
      // Process the data more efficiently
      const transformedRequests = (approvals || [])
        .filter(approval => approval.request) // Filter out any null requests
        .map(approval => {
          // Handle request - could be an object or array
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

          // Extract step data - could be an object or array
          let stepName = null;
          let stepType = null;
          if (approval.step) {
            if (Array.isArray(approval.step) && approval.step.length > 0) {
              stepName = approval.step[0].step_name;
              stepType = approval.step[0].step_type;
            } else if (typeof approval.step === 'object') {
              stepName = (approval.step as any).step_name;
              stepType = (approval.step as any).step_type;
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
            step_name: stepName,
            step_type: stepType,
            approval_id: approval.id,
            requester: null // Will be populated below
          };
        })
        .filter(Boolean); // Remove any null entries
      
      console.log(`Processed ${transformedRequests.length} incoming requests`);
      
      // Add requester information in a more efficient way
      if (transformedRequests.length > 0) {
        const requesterIds = [...new Set(transformedRequests
          .map(req => req.requester_id)
          .filter(Boolean))];
          
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
      
      return transformedRequests as RequestWithApproval[];
    } catch (error) {
      console.error("Error in fetchIncomingRequests:", error);
      throw error;
    }
  };

  const { data: incomingRequests, isLoading: incomingLoading, refetch: refetchIncomingRequests } = useQuery({
    queryKey: ["requests", "incoming", user?.id],
    queryFn: fetchIncomingRequests,
    enabled: !!user
  });

  return { incomingRequests, incomingLoading, refetchIncomingRequests };
};
