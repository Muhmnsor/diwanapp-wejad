
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTaskButtonStates = (taskId: string) => {
  const [hasNewDiscussion, setHasNewDiscussion] = useState(false);
  const [hasDeliverables, setHasDeliverables] = useState(false);
  const [hasTemplates, setHasTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for deliverables
    const checkDeliverables = async () => {
      try {
        const { data, error } = await supabase
          .from("task_deliverables")
          .select("id")
          .eq("task_id", taskId)
          .limit(1);
          
        if (error) throw error;
        setHasDeliverables(data && data.length > 0);
      } catch (error) {
        console.error("Error checking deliverables:", error);
      }
    };

    // Initial check for templates
    const checkTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from("unified_task_attachments")
          .select("id")
          .eq("task_id", taskId)
          .eq("attachment_category", "template")
          .limit(1);
          
        if (error) throw error;
        setHasTemplates(data && data.length > 0);
      } catch (error) {
        console.error("Error checking templates:", error);
      }
    };

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
      setIsLoading(true);
      checkDeliverables();
      checkTemplates();
      checkNewDiscussions();
    }

    // Set up real-time listeners
    const deliverableChannel = supabase
      .channel('task_deliverables_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'task_deliverables',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Deliverable change:', payload);
          if (payload.eventType === 'INSERT') {
            setHasDeliverables(true);
          } else if (payload.eventType === 'DELETE') {
            // Recheck if there are any remaining deliverables
            checkDeliverables();
          }
        }
      )
      .subscribe();
      
    const templateChannel = supabase
      .channel('task_templates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_task_attachments',
          filter: `task_id=eq.${taskId} AND attachment_category=eq.template`
        },
        (payload) => {
          console.log('Template change:', payload);
          if (payload.eventType === 'INSERT') {
            setHasTemplates(true);
          } else if (payload.eventType === 'DELETE') {
            // Recheck if there are any remaining templates
            checkTemplates();
          }
        }
      )
      .subscribe();
      
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
      supabase.removeChannel(deliverableChannel);
      supabase.removeChannel(templateChannel);
      supabase.removeChannel(discussionChannel);
    };
  }, [taskId]);

  // Reset new discussion flag (call when discussion dialog is opened)
  const resetDiscussionFlag = () => {
    setHasNewDiscussion(false);
  };

  return {
    hasNewDiscussion,
    hasDeliverables,
    hasTemplates,
    isLoading,
    resetDiscussionFlag
  };
};
