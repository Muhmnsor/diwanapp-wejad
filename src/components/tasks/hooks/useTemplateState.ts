
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTemplateState = (taskId: string) => {
  const [hasTemplates, setHasTemplates] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      checkTemplates();
    }

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

    // Clean up subscriptions
    return () => {
      supabase.removeChannel(templateUnifiedChannel);
      supabase.removeChannel(templateChannel);
    };
  }, [taskId]);

  return {
    hasTemplates,
    isLoading
  };
};
