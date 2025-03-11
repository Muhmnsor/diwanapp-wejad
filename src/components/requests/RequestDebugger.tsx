
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * RequestDebugger component for monitoring request operations in development
 * This component doesn't render anything to the DOM but adds listeners for debugging
 */
export const RequestDebugger = () => {
  useEffect(() => {
    console.log('🛠️ Request Debugger activated');
    
    // Check which workflow steps table exists
    const checkTables = async () => {
      try {
        const { data: workflowStepsExists } = await supabase.rpc('check_table_exists', { 
          table_name: 'workflow_steps' 
        });
        
        const { data: requestWorkflowStepsExists } = await supabase.rpc('check_table_exists', { 
          table_name: 'request_workflow_steps' 
        });
        
        console.log('📊 Database tables check:', {
          workflow_steps_exists: workflowStepsExists?.[0]?.table_exists,
          request_workflow_steps_exists: requestWorkflowStepsExists?.[0]?.table_exists
        });
      } catch (error) {
        console.error('Error checking tables:', error);
      }
    };
    
    checkTables();
    
    // Set up a subscription to requests table changes
    const channel = supabase
      .channel('requests-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'requests'
      }, (payload) => {
        console.log('📣 Request change detected:', payload.eventType);
        console.log('📊 Request data:', payload.new);
        
        // If a new request was created
        if (payload.eventType === 'INSERT') {
          const newRequest = payload.new;
          // Log workflow information if present
          if (newRequest.workflow_id) {
            console.log('🔄 Request has workflow_id:', newRequest.workflow_id);
            console.log('⏱️ Current step ID:', newRequest.current_step_id);
            
            // Diagnose workflow steps
            diagnoseWorkflowSteps(newRequest.workflow_id, newRequest.current_step_id);
          }
        }
      })
      .subscribe();
      
    // Helper function to diagnose workflow steps
    const diagnoseWorkflowSteps = async (workflowId: string, currentStepId: string | null) => {
      if (!workflowId) return;
      
      try {
        // Try workflow_steps first
        let { data: steps, error } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflowId)
          .order('step_order', { ascending: true });
          
        // If there's an error or no data, try request_workflow_steps
        if (error || !steps || steps.length === 0) {
          console.log('No steps found in workflow_steps table, trying request_workflow_steps');
          const { data: oldSteps, error: oldError } = await supabase
            .from('request_workflow_steps')
            .select('*')
            .eq('workflow_id', workflowId)
            .order('step_order', { ascending: true });
            
          if (oldError) {
            console.error('Error fetching from request_workflow_steps:', oldError);
          } else {
            steps = oldSteps;
            console.log('Found steps in request_workflow_steps table:', steps?.length || 0);
          }
        } else {
          console.log('Found steps in workflow_steps table:', steps?.length || 0);
        }
        
        if (steps && steps.length > 0) {
          console.log(`🔍 Found ${steps.length} steps for workflow ${workflowId}`);
          
          if (currentStepId) {
            const currentStep = steps.find(step => step.id === currentStepId);
            if (currentStep) {
              console.log('✅ Current step exists in workflow:', currentStep);
            } else {
              console.error('❌ Current step ID does not match any step in the workflow!');
            }
          }
        } else {
          console.error('❌ No workflow steps found for workflow ID:', workflowId);
        }
      } catch (e) {
        console.error('Error diagnosing workflow steps:', e);
      }
    };

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

