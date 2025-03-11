
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
      console.log("User role:", user.role);
      console.log("User isAdmin:", user.isAdmin);
      
      // First, check for direct user approvals
      const { data: directApprovals, error: directError } = await supabase
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
      
      if (directError) {
        console.error("Error fetching direct approvals:", directError);
        console.error("Error code:", directError.code);
        console.error("Error message:", directError.message);
      }
      
      console.log(`Found ${directApprovals?.length || 0} direct pending approvals`, directApprovals);
      
      // Check if user has any roles
      let roleApprovals = [];
      if (user.role) {
        console.log("Checking for role-based approvals with role:", user.role);
        
        // Get the role ID based on role name
        const { data: roleData } = await supabase
          .from("roles")
          .select("id")
          .eq("name", user.role)
          .single();
          
        if (roleData?.id) {
          console.log("Found role ID:", roleData.id);
          
          // Get workflow steps where this role is the approver
          const { data: roleSteps } = await supabase
            .from("request_workflow_steps")
            .select("id")
            .eq("approver_type", "role")
            .eq("approver_id", roleData.id);
            
          if (roleSteps && roleSteps.length > 0) {
            console.log("Found role steps:", roleSteps);
            
            // Get approvals for these steps
            const stepIds = roleSteps.map(step => step.id);
            
            const { data: roleBasedApprovals, error: roleError } = await supabase
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
              .in("step_id", stepIds)
              .eq("status", "pending")
              .order("created_at", { ascending: false });
              
            if (roleError) {
              console.error("Error fetching role approvals:", roleError);
            } else {
              console.log(`Found ${roleBasedApprovals?.length || 0} role-based approvals`);
              roleApprovals = roleBasedApprovals || [];
            }
          }
        }
      }
      
      // Combine direct and role-based approvals
      const allApprovals = [...(directApprovals || []), ...roleApprovals];
      console.log(`Combined ${allApprovals.length} total approvals`);
      
      // Process the data efficiently
      const transformedRequests = (allApprovals || [])
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
      
      // Get requester information efficiently by using a Set for unique IDs
      if (transformedRequests.length > 0) {
        const requesterIds = [...new Set(transformedRequests
          .map(req => req.requester_id)
          .filter(Boolean))];
          
        if (requesterIds.length > 0) {
          const { data: users, error: usersError } = await supabase
            .from("profiles")
            .select("id, display_name, email")
            .in("id", requesterIds);
            
          if (usersError) {
            console.error("Error fetching users:", usersError);
          }
          
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
