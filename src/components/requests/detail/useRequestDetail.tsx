
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      console.log("Fetching request details for:", requestId);
      
      try {
        const { data, error } = await supabase
          .rpc('get_request_details', { p_request_id: requestId });
        
        if (error) {
          console.error("Error fetching request details:", error);
          throw error;
        }
        
        console.log("Request details fetched successfully:", data);
        
        // Add additional debug info
        if (!data.workflow || !data.workflow.id) {
          console.warn("Workflow data is missing or incomplete:", data.workflow);
        }
        
        if (!data.current_step || !data.current_step.id) {
          console.warn("Current step data is missing or incomplete:", data.current_step);
        }
        
        if (!data.requester || !data.requester.display_name) {
          console.warn("Requester data is missing or incomplete:", data.requester);
        }
        
        return data;
      } catch (err) {
        console.error("Exception in request details fetch:", err);
        toast.error("حدث خطأ أثناء تحميل تفاصيل الطلب");
        throw err;
      }
    },
    refetchOnWindowFocus: false
  });

  // Check if the current user is the approver for the current step
  const isCurrentApprover = () => {
    if (!data || !user) return false;
    
    const currentStep = data.current_step;
    if (!currentStep || !currentStep.id) return false;
    
    // Check if user is approver for current step
    const approvers = data.approvals?.filter(
      (approval: any) => 
        approval.step?.id === currentStep.id && 
        approval.approver?.id === user.id &&
        approval.status === "pending"
    );
    
    return approvers && approvers.length > 0;
  };

  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  return {
    data,
    isLoading,
    error,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    handleApproveClick,
    handleRejectClick,
    isCurrentApprover,
    user
  };
};
