import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRequestDetails, diagnoseRequestWorkflow, debugRequestWorkflow } from "./services/requestService";
import { useAuthStore } from "@/store/refactored-auth";

export const useRequestDetail = (requestId: string) => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["request-details", requestId],
    queryFn: () => getRequestDetails(requestId),
    enabled: !!requestId,
  });

  const handleApproveClick = () => {
    setIsApproveDialogOpen(true);
  };

  const handleRejectClick = () => {
    setIsRejectDialogOpen(true);
  };

  // Check if the current user is the approver for the current step
  const isCurrentApprover = () => {
    if (!data || !data.current_step || !user) return false;
    
    // Admin users can approve any step
    if (user.isAdmin) return true;
    
    // Otherwise, check if the user is the specific approver for this step
    return data.current_step.id && 
           data.current_step.approver_id === user.id;
  };

  // Check if the user has already submitted their opinion
  const hasSubmittedOpinion = () => {
    if (!data || !data.approvals || !user) return false;
    
    const currentStepId = data.request.current_step_id;
    if (!currentStepId) return false;
    
    return data.approvals.some(
      approval => approval.step_id === currentStepId && 
                approval.approver_id === user.id
    );
  };
  
  // Function to diagnose workflow issues
  const diagnoseWorkflow = async () => {
    try {
      const result = await diagnoseRequestWorkflow(requestId);
      return result;
    } catch (error) {
      console.error("Error diagnosing workflow:", error);
      throw error;
    }
  };
  
  // Function to debug workflow issues
  const debugWorkflow = async () => {
    try {
      const result = await debugRequestWorkflow(requestId);
      return result;
    } catch (error) {
      console.error("Error debugging workflow:", error);
      throw error;
    }
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
    hasSubmittedOpinion,
    refetch,
    diagnoseWorkflow,
    debugWorkflow
  };
};
