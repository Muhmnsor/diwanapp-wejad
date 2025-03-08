
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useDeliverableState = (taskId: string) => {
  const [hasDeliverables, setHasDeliverables] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial check for deliverables
    const checkDeliverables = async () => {
      try {
        let hasAnyDeliverables = false;
        
        // Check task_deliverables table
        const { data: deliverableData, error: deliverableError } = await supabase
          .from("task_deliverables")
          .select("id")
          .eq("task_id", taskId)
          .limit(1);
          
        if (deliverableError) {
          console.error("Error checking task_deliverables:", deliverableError);
        } else if (deliverableData && deliverableData.length > 0) {
          console.log("Found deliverables in task_deliverables:", deliverableData.length);
          hasAnyDeliverables = true;
        }
        
        // Also check unified_task_attachments with deliverable category
        if (!hasAnyDeliverables) {
          const { data: unifiedData, error: unifiedError } = await supabase
            .from("unified_task_attachments")
            .select("id")
            .eq("task_id", taskId)
            .eq("attachment_category", "assignee")
            .limit(1);
            
          if (unifiedError) {
            console.error("Error checking unified deliverables:", unifiedError);
          } else if (unifiedData && unifiedData.length > 0) {
            console.log("Found deliverables in unified_task_attachments:", unifiedData.length);
            hasAnyDeliverables = true;
          }
        }
        
        // Set state based on combined results
        setHasDeliverables(hasAnyDeliverables);
        console.log(`Final deliverables state for task ${taskId}:`, hasAnyDeliverables);
      } catch (error) {
        console.error("Error checking deliverables:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      checkDeliverables();
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
      
    // Also listen for deliverable changes in unified_task_attachments
    const unifiedDeliverableChannel = supabase
      .channel('unified_deliverable_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'unified_task_attachments',
          filter: `task_id=eq.${taskId} AND attachment_category=eq.assignee`
        },
        (payload) => {
          console.log('Deliverable change in unified_task_attachments:', payload);
          if (payload.eventType === 'INSERT') {
            setHasDeliverables(true);
          } else if (payload.eventType === 'DELETE') {
            // Recheck if there are any remaining deliverables
            checkDeliverables();
          }
        }
      )
      .subscribe();

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(deliverableChannel);
      supabase.removeChannel(unifiedDeliverableChannel);
    };
  }, [taskId]);

  return {
    hasDeliverables,
    isLoading
  };
};
