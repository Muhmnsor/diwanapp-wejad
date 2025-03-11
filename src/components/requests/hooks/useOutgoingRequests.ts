
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
          // The request_type can be an object or an array with a single object
          const requestTypeData = Array.isArray(request.request_type) 
            ? request.request_type[0] 
            : request.request_type;
            
          if (requestTypeData) {
            requestType = {
              id: requestTypeData.id,
              name: requestTypeData.name
            };
          }
        }
        
        // Handle current_step normalization
        let stepId = null;
        let stepName = null;
        let stepType = null;
        
        if (request.current_step) {
          // The current_step can be an object or an array with a single object
          const stepData = Array.isArray(request.current_step)
            ? request.current_step[0]
            : request.current_step;
            
          if (stepData) {
            stepId = stepData.id;
            stepName = stepData.step_name;
            stepType = stepData.step_type;
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
