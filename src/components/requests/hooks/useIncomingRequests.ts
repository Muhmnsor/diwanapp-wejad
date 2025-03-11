
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
      
      // Get requests where the current user is the approver for the current step
      const { data, error } = await supabase
        .from("requests")
        .select(`
          id,
          title,
          status,
          priority,
          created_at,
          current_step_id,
          requester_id,
          request_type_id,
          request_type:request_types(id, name),
          current_step:request_workflow_steps!inner(
            id,
            step_name,
            step_type,
            approver_id,
            approver_type
          )
        `)
        .eq("status", "pending")
        .eq("current_step.approver_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching incoming requests:", error);
        return [];
      }
      
      if (!data || data.length === 0) {
        console.log("No incoming requests found for user:", user.id);
        return [];
      }
      
      console.log(`Found ${data.length} incoming requests`, data);
      
      // Transform the data into the expected format
      const transformedRequests = data.map(request => {
        // Properly extract current_step properties from the object, not the array
        return {
          id: request.id,
          title: request.title,
          status: request.status,
          priority: request.priority,
          created_at: request.created_at,
          current_step_id: request.current_step_id,
          requester_id: request.requester_id,
          request_type_id: request.request_type_id,
          // Fix the request_type property to be an object, not an array
          request_type: request.request_type ? {
            id: request.request_type.id,
            name: request.request_type.name
          } : null,
          // Extract properties from the current_step object
          step_id: request.current_step?.id,
          step_name: request.current_step?.step_name,
          step_type: request.current_step?.step_type,
          approval_id: null, // We'll fetch this separately if needed
          requester: null // Will be populated below
        };
      });
      
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
