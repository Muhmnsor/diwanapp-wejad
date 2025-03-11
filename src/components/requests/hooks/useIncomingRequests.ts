
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
      
      // This query fetches requests where:
      // 1. Either the user is directly the approver in the current step
      // 2. Or the user has a role that is assigned as an approver in the current step
      const { data: directApprover, error: directError } = await supabase
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
            step_type,
            approver_id,
            approver_type
          )
        `)
        .eq("status", "pending")
        .eq("current_step.approver_id", user.id)
        .eq("current_step.approver_type", "user")
        .order("created_at", { ascending: false });
      
      if (directError) {
        console.error("Error fetching direct approver requests:", directError);
      }
      
      // Get role-based approvals 
      // First get the user's roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
      }
      
      let roleBasedRequests = [];
      if (userRoles && userRoles.length > 0) {
        const roleIds = userRoles.map(ur => ur.role_id);
        
        // Then fetch requests where the approver_id is one of the user's roles
        const { data: roleApprover, error: roleError } = await supabase
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
              step_type,
              approver_id,
              approver_type
            )
          `)
          .eq("status", "pending")
          .eq("current_step.approver_type", "role")
          .in("current_step.approver_id", roleIds)
          .order("created_at", { ascending: false });
        
        if (roleError) {
          console.error("Error fetching role-based approver requests:", roleError);
        } else if (roleApprover) {
          roleBasedRequests = roleApprover;
        }
      }
      
      // Combine both types of requests
      const allRequests = [...(directApprover || []), ...roleBasedRequests];
      
      if (!allRequests || allRequests.length === 0) {
        console.log("No incoming requests found for user:", user.id);
        return [];
      }
      
      console.log(`Found ${allRequests.length} incoming requests`, allRequests);
      
      // Transform the data into the expected format
      const transformedRequests = allRequests.map(request => {
        // Log raw data to debug
        console.log("Processing request:", request.id);
        console.log("Request type data:", JSON.stringify(request.request_type));
        console.log("Current step data:", JSON.stringify(request.current_step));
        
        // Safely extract request_type properties
        let requestType = null;
        if (request.request_type) {
          if (Array.isArray(request.request_type) && request.request_type.length > 0) {
            requestType = {
              id: request.request_type[0]?.id,
              name: request.request_type[0]?.name
            };
          } else if (typeof request.request_type === 'object' && request.request_type !== null) {
            // Handle direct object access
            const requestTypeObj = request.request_type as any;
            requestType = {
              id: requestTypeObj.id,
              name: requestTypeObj.name
            };
          }
        }
        
        // Safely extract current_step properties
        let stepId = null;
        let stepName = null;
        let stepType = null;
        
        if (request.current_step) {
          if (Array.isArray(request.current_step) && request.current_step.length > 0) {
            const stepObj = request.current_step[0];
            stepId = stepObj?.id;
            stepName = stepObj?.step_name;
            stepType = stepObj?.step_type;
          } else if (typeof request.current_step === 'object' && request.current_step !== null) {
            // Handle direct object access
            const stepObj = request.current_step as any;
            stepId = stepObj.id;
            stepName = stepObj.step_name;
            stepType = stepObj.step_type;
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
          step_id: stepId,
          step_name: stepName,
          step_type: stepType,
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
      
      // For debugging: let's also check for approval records
      for (const request of transformedRequests) {
        const { data: approvals } = await supabase
          .from("request_approvals")
          .select("id, status")
          .eq("request_id", request.id)
          .eq("approver_id", user.id);
          
        if (approvals && approvals.length > 0) {
          console.log(`Found approval record for request ${request.id}:`, approvals[0]);
          request.approval_id = approvals[0].id;
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
