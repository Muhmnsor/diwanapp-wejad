
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDiscussionState = (taskId: string) => {
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for unread discussion messages
    const checkNewDiscussions = async () => {
      try {
        // Check for any comments, in the future could be improved to check for read status
        const { data, error } = await supabase
          .from("unified_task_comments")
          .select("id")
          .eq("task_id", taskId)
          .order("created_at", { ascending: false })
          .limit(1);
          
        if (error) throw error;
        setHasNewDiscussion(data && data.length > 0);
      } catch (error) {
        console.error("Error checking discussions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      checkNewDiscussions();
    }

    // Set up real-time listeners
    const discussionChannel = supabase
      .channel('task_comments_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'unified_task_comments',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('New comment added:', payload);
          setHasNewDiscussion(true);
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(discussionChannel);
    };
  }, [taskId]);

  // Reset new discussion flag (call when discussion dialog is opened)
  const resetDiscussionFlag = () => {
    setHasNewDiscussion(false);
  };

  return {
    hasNewDiscussion,
    isLoading,
    resetDiscussionFlag
  };
};
