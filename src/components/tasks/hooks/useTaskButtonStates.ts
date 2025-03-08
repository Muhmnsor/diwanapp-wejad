
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
        console.log("Checking templates for task:", taskId);
        
        let hasAnyTemplates = false;
        
        // Check unified_task_attachments with template category
        const { data: unifiedData, error: unifiedError } = await supabase
          .from("unified_task_attachments")
          .select("id")
          .eq("task_id", taskId)
          .eq("attachment_category", "template")
          .limit(1);
          
        if (unifiedError) {
          console.error("Error checking unified templates:", unifiedError);
        } else if (unifiedData && unifiedData.length > 0) {
          console.log("Found templates in unified_task_attachments:", unifiedData.length);
          hasAnyTemplates = true;
        }
        
        // Always check task_templates too, regardless of previous result
        const { data: templateData, error: templateError } = await supabase
          .from('task_templates')
          .select('id')
          .eq('task_id', taskId)
          .limit(1);
          
        if (templateError) {
          console.error('Error checking task_templates:', templateError);
        } else if (templateData && templateData.length > 0) {
          console.log("Found templates in task_templates:", templateData.length);
          hasAnyTemplates = true;
        }
        
        // Set state based on combined results
        setHasTemplates(hasAnyTemplates);
        console.log(`Final templates state for task ${taskId}:`, hasAnyTemplates);
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
      
    // Listen for templates in both tables
    const templateUnifiedChannel = supabase
      .channel('task_templates_unified_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_task_attachments',
          filter: `task_id=eq.${taskId} AND attachment_category=eq.template`
        },
        (payload) => {
          console.log('Template change in unified_task_attachments:', payload);
          if (payload.eventType === 'INSERT') {
            setHasTemplates(true);
          } else if (payload.eventType === 'DELETE') {
            // Recheck if there are any remaining templates
            checkTemplates();
          }
        }
      )
      .subscribe();
    
    // Also listen for templates in the task_templates table
    const templateChannel = supabase
      .channel('task_templates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_templates',
          filter: `task_id=eq.${taskId}`
        },
        (payload) => {
          console.log('Template change in task_templates:', payload);
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
      supabase.removeChannel(templateUnifiedChannel);
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
