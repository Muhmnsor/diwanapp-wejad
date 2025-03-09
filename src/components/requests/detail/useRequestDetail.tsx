
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_request_details', { p_request_id: requestId });
      
      if (error) {
        console.error("Error fetching request details:", error);
        throw error;
      }
      
      return data;
    }
  });

  // Check if the current user is the approver for the current step
  const isCurrentApprover = () => {
    if (!data || !user) return false;
    
    const currentStep = data.current_step;
    return currentStep && currentStep.id && user.id === currentStep.approver_id;
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
