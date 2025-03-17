
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export const useRequestDetail = (requestId: string) => {
  const { user } = useAuthStore();
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['request', requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          requester:requested_by(id, display_name, email),
          request_type(*),
          request_status(*),
          current_assignee(id, display_name, email),
          workflow:workflow_id(*)
        `)
        .eq('id', requestId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });
  
  // Check if the current user is the requester
  const isRequester = !!data && !!user && data.requested_by === user.id;
  
  // Handle approve request
  const handleApprove = async (comments?: string) => {
    // Implementation for approving request
    console.log('Approving request', requestId, comments);
    setIsApproveDialogOpen(false);
  };
  
  // Handle reject request
  const handleReject = async (comments: string) => {
    // Implementation for rejecting request
    console.log('Rejecting request', requestId, comments);
    setIsRejectDialogOpen(false);
  };
  
  // Handle adding a note
  const handleAddNote = async (note: string) => {
    // Implementation for adding a note
    console.log('Adding note to request', requestId, note);
    setIsAddNoteDialogOpen(false);
  };
  
  // Handle reassigning the request
  const handleReassign = async (userId: string) => {
    // Implementation for reassigning
    console.log('Reassigning request', requestId, 'to user', userId);
  };
  
  // Handle fixing workflow errors
  const handleFixWorkflow = async () => {
    // Implementation for fixing workflow
    console.log('Fixing workflow for request', requestId);
  };
  
  return {
    data,
    isLoading,
    error,
    isRequester,
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    isAddNoteDialogOpen,
    setIsAddNoteDialogOpen,
    handleApprove,
    handleReject,
    handleAddNote,
    handleReassign,
    handleFixWorkflow
  };
};
