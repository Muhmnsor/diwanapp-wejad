
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/authStore";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: async () => {
      try {
        // Use the security definer function to get request details
        const { data, error } = await supabase
          .rpc('get_request_details', { p_request_id: requestId });
        
        if (error) {
          console.error("Error fetching request details:", error);
          throw error;
        }
        
        return data;
      } catch (error) {
        console.error("Error in request details fetch:", error);
        throw error;
      }
    }
  });

  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  // Check if the current user is an approver for this request
  const canApprove = data?.request?.status === 'pending' && 
                      data?.current_step?.id && 
                      data?.request?.requester_id !== user?.id;

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
    canApprove,
    refetch,
    user
  };
};
