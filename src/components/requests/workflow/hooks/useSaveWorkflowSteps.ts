
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { WorkflowStep } from '../../types';
import { v4 as uuidv4 } from 'uuid';

export const useSaveWorkflowSteps = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to prepare steps for saving
  const prepareStepsForSave = (
    steps: WorkflowStep[], 
    workflowId: string
  ): WorkflowStep[] => {
    return steps.map((step, index) => ({
      ...step,
      workflow_id: workflowId,
      step_order: index,
      // Ensure each step has an ID
      id: step.id || uuidv4()
    }));
  };

  // Saves all workflow steps - creates new ones and updates existing ones
  const saveWorkflowSteps = async (
    steps: WorkflowStep[], 
    workflowId: string
  ): Promise<{ success: boolean; error?: any }> => {
    if (!workflowId) {
      console.error('Cannot save steps: No workflow ID provided');
      return { success: false, error: 'No workflow ID provided' };
    }

    setIsLoading(true);
    
    try {
      console.log('Saving workflow steps for workflow:', workflowId);
      console.log('Steps to save:', steps);
      
      // Prepare steps for saving
      const preparedSteps = prepareStepsForSave(steps, workflowId);
      
      // First, delete all existing steps for this workflow
      const { error: deleteError } = await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflowId);
        
      if (deleteError) {
        console.error('Error deleting existing workflow steps:', deleteError);
        throw deleteError;
      }
      
      // Then insert all steps
      if (preparedSteps.length > 0) {
        const { error: insertError } = await supabase
          .from('workflow_steps')
          .insert(preparedSteps);
          
        if (insertError) {
          console.error('Error inserting workflow steps:', insertError);
          throw insertError;
        }
      }
      
      toast.success('تم حفظ مسار العمل بنجاح');
      return { success: true };
    } catch (error) {
      console.error('Error saving workflow steps:', error);
      toast.error('حدث خطأ أثناء حفظ مسار العمل');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Loads workflow steps for a given workflow ID
  const loadWorkflowSteps = async (workflowId: string): Promise<WorkflowStep[]> => {
    if (!workflowId) {
      console.warn('Cannot load steps: No workflow ID provided');
      return [];
    }
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select(`
          id,
          step_name,
          step_type,
          approver_id,
          is_required,
          step_order,
          instructions,
          workflow_id,
          users:approver_id (
            id,
            display_name
          )
        `)
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });
        
      if (error) {
        console.error('Error loading workflow steps:', error);
        throw error;
      }
      
      // Transform data to include approver_name from the joined users table
      const transformedSteps = data.map(step => {
        // Handle the nested users object properly
        let approverName = null;
        if (step.users) {
          approverName = step.users.display_name || null;
        }
        
        return {
          ...step,
          approver_name: approverName,
          // Remove the nested users object
          users: undefined
        };
      });
      
      return transformedSteps as WorkflowStep[];
    } catch (error) {
      console.error('Error in loadWorkflowSteps:', error);
      toast.error('حدث خطأ أثناء تحميل خطوات مسار العمل');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveWorkflowSteps,
    loadWorkflowSteps
  };
};
