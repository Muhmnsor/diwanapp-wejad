
import { useState, useEffect } from "react";
import { IdeaCountdown } from "./components/IdeaCountdown";
import { StatusBadge } from "./components/StatusBadge";
import { ExtendButton } from "./components/ExtendButton";
import { ExtendDiscussionDialog } from "./dialogs/ExtendDiscussionDialog";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface IdeaMetadataProps {
  id: string;
  created_by: string;
  created_at: string;
  status: string;
  title: string;
  discussion_period?: string;
}

export const IdeaMetadata = ({
  id,
  created_by,
  created_at,
  status,
  title,
  discussion_period
}: IdeaMetadataProps) => {
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render when needed
  const queryClient = useQueryClient();
  
  // Set up real-time subscription to idea updates
  useEffect(() => {
    console.log("Setting up real-time subscription for idea:", id);
    
    const channel = supabase
      .channel(`idea-changes-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ideas',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log("Received real-time update for idea:", payload);
          
          // Invalidate the query to refresh the idea data
          queryClient.invalidateQueries({ queryKey: ['idea', id] });
          
          // Force re-render of this component and children
          setRefreshKey(prev => prev + 1);
        }
      )
      .subscribe();
      
    return () => {
      console.log("Cleaning up real-time subscription");
      supabase.removeChannel(channel);
    };
  }, [id, queryClient]);
  
  const handleExtendDialogOpen = () => {
    setIsExtendDialogOpen(true);
  };
  
  const handleExtendDialogClose = () => {
    setIsExtendDialogOpen(false);
  };
  
  const handleExtendSuccess = () => {
    // Trigger a refresh of the idea data after extension
    queryClient.invalidateQueries({ queryKey: ['idea', id] });
    setRefreshKey(prev => prev + 1);
    console.log("Discussion period extended successfully, forcing refresh");
  };
  
  return <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 border border-purple-100 my-[7px]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <h1 className="text-lg sm:text-xl font-bold text-purple-800 truncate">{title}</h1>
        
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <IdeaCountdown 
            key={`countdown-${refreshKey}`} 
            discussion_period={discussion_period} 
            created_at={created_at} 
            ideaId={id} 
          />
          <ExtendButton onClick={handleExtendDialogOpen} />
          <StatusBadge 
            key={`status-${refreshKey}`}
            status={status} 
            ideaId={id} 
            discussionPeriod={discussion_period}
            createdAt={created_at}
          />
        </div>
      </div>
      
      <ExtendDiscussionDialog 
        isOpen={isExtendDialogOpen} 
        onClose={handleExtendDialogClose} 
        ideaId={id} 
        onSuccess={handleExtendSuccess} 
      />
    </div>;
};
