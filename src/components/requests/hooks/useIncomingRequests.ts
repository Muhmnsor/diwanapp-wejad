
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
      
      // First, get the user's role ID from user_roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.id);
      
      if (rolesError) {
        console.error("Error fetching user roles:", rolesError);
        return [];
      }
      
      const roleIds = userRoles ? userRoles.map(ur => ur.role_id) : [];
      console.log("User roles:", roleIds);
      
      // Query pending approvals where current user is a direct approver
      const { data: directApprovals, error: directApprovalsError } = await supabase
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
      
      if (directApprovalsError) {
        console.error("Error fetching direct approvals:", directApprovalsError);
        return [];
      }
      
      // Query for role-based approvals (where the step's approver_type is 'role' and approver_id matches user's role)
      let roleBasedApprovals = [];
      
      if (roleIds.length > 0) {
        // Get all pending requests with current steps that have role-based approvers matching user's roles
        const { data: pendingRequests, error: pendingRequestsError } = await supabase
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
            current_step:request_workflow_steps!current_step_id(
              id,
              step_name,
              step_type,
              approver_id,
              approver_type
            )
          `)
          .eq("status", "pending")
          .in("current_step.approver_id", roleIds)
          .eq("current_step.approver_type", "role");
          
        if (pendingRequestsError) {
          console.error("Error fetching role-based requests:", pendingRequestsError);
        } else if (pendingRequests && pendingRequests.length > 0) {
          console.log("Found role-based requests:", pendingRequests.length);
          
          // For each request, check if there's already an approval record for this user
          // If not, we'll create one (or just include it in the results for display)
          for (const request of pendingRequests) {
            const { data: existingApproval } = await supabase
              .from("request_approvals")
              .select("id")
              .eq("request_id", request.id)
              .eq("approver_id", user.id)
              .eq("step_id", request.current_step_id)
              .maybeSingle();
              
            // If no approval exists for this user yet, create a virtual approval entry
            // or format it to match the structure of directApprovals
            if (!existingApproval) {
              roleBasedApprovals.push({
                id: null, // No approval ID yet since it doesn't exist in the database
                request_id: request.id,
                status: "pending",
                step_id: request.current_step_id,
                request: request,
                step: request.current_step
              });
            }
          }
        }
      }
      
      console.log(`Found ${directApprovals?.length || 0} direct approvals and ${roleBasedApprovals.length} role-based approvals`);
      
      // Combine direct and role-based approvals
      const allApprovals = [...(directApprovals || []), ...roleBasedApprovals];
      
      // Process the data
      const transformedRequests = allApprovals
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
      
      return transformedRequests as RequestWithApproval[];
    } catch (error) {
      console.error("Error in fetchIncomingRequests:", error);
      return [];
    }
  };

  const { data: incomingRequests, isLoading: incomingLoading, refetch: refetchIncomingRequests } = useQuery({
    queryKey: ["requests", "incoming", user?.id],
    queryFn: fetchIncomingRequests,
    enabled: !!user
  });

  return { incomingRequests, incomingLoading, refetchIncomingRequests };
};
