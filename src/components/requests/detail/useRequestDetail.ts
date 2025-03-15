
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/store/refactored-auth';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

export const useRequestDetail = (requestId: string) => {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const { user } = useAuthStore();
  
  // Fetch request details with related data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['request-details', requestId],
    queryFn: async () => {
      console.log('Fetching request details for ID:', requestId);
      try {
        // Log request view
        await supabase.rpc('log_request_view', {
          p_request_id: requestId,
          p_metadata: {
            client_info: navigator.userAgent,
            view_time: new Date().toISOString()
          }
        });
        
        // Get details
        const { data, error } = await supabase.rpc('get_request_details', {
          p_request_id: requestId
        });
        
        if (error) throw error;
        console.log('Request details loaded:', data);
        return data;
      } catch (error) {
        console.error('Error fetching request details:', error);
        throw error;
      }
    },
    refetchOnWindowFocus: false
  });
  
  // Handlers for dialog open/close
  const handleApproveClick = () => {
    console.log('Opening approve dialog');
    setIsApproveDialogOpen(true);
  };
  
  const handleRejectClick = () => {
    console.log('Opening reject dialog');
    setIsRejectDialogOpen(true);
  };
  
  // Check if the current user is an approver for this request
  const isCurrentApprover = () => {
    if (!data || !data.current_step || !user) return false;
    
    const { current_step } = data;
    
    // Get the approver information from the step
    const approverType = current_step.approver_type;
    const approverId = current_step.approver_id;
    
    if (approverType === 'user') {
      return approverId === user.id;
    } else if (approverType === 'role') {
      // For role-based approvals, check if the user has the required role
      // This information would need to come from the user's roles
      return user.roles?.includes(approverId) || false;
    }
    
    return false;
  };
  
  // Check if the user has already submitted an opinion for the current step
  const hasSubmittedOpinion = () => {
    if (!data || !data.approvals || !user) return false;
    
    // Check if there's already an approval record for this user in the current step
    return data.approvals.some(approval => 
      approval.approver?.id === user.id && 
      approval.step?.id === data.request?.current_step_id
    );
  };

  // Automatically refresh data when dialogs are closed 
  useEffect(() => {
    if (!isApproveDialogOpen && !isRejectDialogOpen) {
      refetch();
    }
  }, [isApproveDialogOpen, isRejectDialogOpen, refetch]);

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
    refetch
  };
};
