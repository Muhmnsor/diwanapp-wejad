
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export const useOutgoingRequests = () => {
  const { user } = useAuthStore();
  
  const fetchOutgoingRequests = async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      console.log("Fetching outgoing requests for user:", user.id);
      
      // Direct query for better performance and reliability
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
          current_step:request_workflow_steps(
            id, 
            step_name,
            step_type
          )
        `)
        .eq("requester_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching outgoing requests:", error);
        return [];
      }
      
      console.log(`Fetched ${data?.length || 0} outgoing requests`);
      
      // Normalize the data structure to match our expected format
      const normalizedData = (data || []).map(request => {
        // Handle request_type normalization
        let requestType = null;
        if (request.request_type) {
          if (Array.isArray(request.request_type) && request.request_type.length > 0) {
            requestType = {
              id: request.request_type[0].id,
              name: request.request_type[0].name
            };
          } else if (typeof request.request_type === 'object' && request.request_type !== null) {
            requestType = {
              id: request.request_type.id,
              name: request.request_type.name
            };
          }
        }
        
        // Handle current_step normalization
        let stepId = null;
        let stepName = null;
        let stepType = null;
        
        if (request.current_step) {
          if (Array.isArray(request.current_step) && request.current_step.length > 0) {
            stepId = request.current_step[0].id;
            stepName = request.current_step[0].step_name;
            stepType = request.current_step[0].step_type;
          } else if (typeof request.current_step === 'object' && request.current_step !== null) {
            stepId = request.current_step.id;
            stepName = request.current_step.step_name;
            stepType = request.current_step.step_type;
          }
        }
        
        return {
          ...request,
          request_type: requestType,
          step_id: stepId,
          step_name: stepName,
          step_type: stepType
        };
      });
      
      console.log("Normalized outgoing requests:", normalizedData);
      return normalizedData;
    } catch (error) {
      console.error("Error in fetchOutgoingRequests:", error);
      return [];
    }
  };

  const { 
    data: outgoingRequests, 
    isLoading: outgoingLoading, 
    refetch: refetchOutgoingRequests 
  } = useQuery({
    queryKey: ["requests", "outgoing"],
    queryFn: fetchOutgoingRequests,
    enabled: !!user
  });

  return { outgoingRequests, outgoingLoading, refetchOutgoingRequests };
};
