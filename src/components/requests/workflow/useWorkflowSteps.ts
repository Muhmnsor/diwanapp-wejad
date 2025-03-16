import { WorkflowStep } from "../types";
import { useUsersList } from "./hooks/useUsersList";
import { useWorkflowState } from "./hooks/useWorkflowState";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSaveWorkflowSteps } from "./hooks/useSaveWorkflowSteps";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface UseWorkflowStepsProps {
  requestTypeId: string | null;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
  initialSteps?: WorkflowStep[];
  initialWorkflowId?: string | null;
}

export const useWorkflowSteps = ({ 
  requestTypeId,
  onWorkflowStepsUpdated,
  initialSteps = [],
  initialWorkflowId = null
}: UseWorkflowStepsProps) => {
  // Get users for approver selection
  const { users } = useUsersList();
  const { saveWorkflowSteps } = useSaveWorkflowSteps();
  
  // State management for workflow steps
  const {
    workflowId,
    setWorkflowId,
    steps: workflowSteps,
    setSteps: setWorkflowSteps,
    currentStep,
    setCurrentStep,
    editingStepIndex,
    setEditingStepIndex,
    initialized,
    setInitialized,
    isLoading,
    setIsLoading,
    error,
    setError,
    resetWorkflowState
  } = useWorkflowState({
    initialSteps,
    initialWorkflowId
  });

  // Initialize with provided steps if available
  useEffect(() => {
    if (!initialized && requestTypeId) {
      if (initialSteps && initialSteps.length > 0) {
        console.log('Using provided initial steps:', initialSteps);
        setWorkflowSteps(initialSteps);
        if (initialWorkflowId) {
          setWorkflowId(initialWorkflowId);
        }
      } else if (initialWorkflowId) {
        // Fetch steps for the provided workflow ID
        fetchWorkflowSteps(initialWorkflowId);
      } else if (requestTypeId) {
        // Check if the request type has a default workflow ID
        fetchRequestTypeDefaultWorkflow(requestTypeId);
      }
      setInitialized(true);
    }
  }, [requestTypeId, initialSteps, initialWorkflowId, initialized]);

  const fetchRequestTypeDefaultWorkflow = async (typeId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('request_types')
        .select('default_workflow_id')
        .eq('id', typeId)
        .single();

      if (error) throw error;
      
      if (data?.default_workflow_id) {
        setWorkflowId(data.default_workflow_id);
        await fetchWorkflowSteps(data.default_workflow_id);
      } else {
        console.log('No default workflow found for request type. Using temp ID.');
        setWorkflowId('temp-workflow-id');
      }
    } catch (err) {
      console.error('Error fetching request type default workflow:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch default workflow'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWorkflowSteps = async (workflowId: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workflow_steps')
        .select(`
          id, step_name, step_type, approver_id, is_required, 
          step_order, instructions, workflow_id,
          users:approver_id (id, display_name)
        `)
        .eq('workflow_id', workflowId)
        .order('step_order', { ascending: true });

      if (error) throw error;

      // Transform data to include approver_name from the joined users table
      const transformedSteps = data.map(step => {
        let approverName = null;
        if (step.users) {
          // Handle nested user object correctly (not an array)
          approverName = step.users.display_name || null;
        }
        
        return {
          ...step,
          approver_name: approverName,
          users: undefined // Remove the nested users object
        };
      });

      setWorkflowSteps(transformedSteps);
    } catch (err) {
      console.error('Error fetching workflow steps:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch workflow steps'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handler for adding a step
  const handleAddStep = useCallback(() => {
    setCurrentStep({
      id: uuidv4(),
      step_name: '',
      step_type: 'decision',
      approver_id: null,
      approver_name: null,
      is_required: true,
      step_order: workflowSteps.length,
      instructions: null,
      workflow_id: workflowId
    });
    setEditingStepIndex(null);
  }, [workflowSteps.length, workflowId]);

  // Handle remove step
  const handleRemoveStep = useCallback((index: number) => {
    const step = workflowSteps[index];
    const updatedSteps = workflowSteps.filter((_, i) => i !== index);
    
    // Fix order of remaining steps
    const reorderedSteps = updatedSteps.map((step, newIdx) => ({
      ...step,
      step_order: newIdx
    }));
    
    setWorkflowSteps(reorderedSteps);
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(reorderedSteps);
    }
  }, [workflowSteps, onWorkflowStepsUpdated]);

  // Handle edit step
  const handleEditStep = useCallback((index: number) => {
    setCurrentStep(workflowSteps[index]);
    setEditingStepIndex(index);
  }, [workflowSteps]);

  // Handle move step
  const handleMoveStep = useCallback((index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === workflowSteps.length - 1)
    ) {
      return; // Cannot move beyond the edges
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedSteps = [...workflowSteps];
    
    // Swap the steps
    [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
    
    // Update order
    const reorderedSteps = updatedSteps.map((step, idx) => ({
      ...step,
      step_order: idx
    }));
    
    setWorkflowSteps(reorderedSteps);
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(reorderedSteps);
    }
  }, [workflowSteps, onWorkflowStepsUpdated]);

  // Save workflow steps to database
  const saveSteps = async (steps: WorkflowStep[]) => {
    if (!workflowId) {
      toast.error('No workflow ID provided for saving steps');
      return false;
    }
    
    setIsLoading(true);
    
    try {
      if (workflowId === 'temp-workflow-id') {
        // Create a new workflow first
        const { data, error } = await supabase
          .from('request_workflows')
          .insert({
            name: `Workflow for Request Type ${requestTypeId}`,
            is_active: true
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Update our workflowId
        setWorkflowId(data.id);
        
        // If successful, set this as the default workflow for the request type
        if (requestTypeId) {
          const { error: updateError } = await supabase
            .from('request_types')
            .update({ default_workflow_id: data.id })
            .eq('id', requestTypeId);
            
          if (updateError) {
            console.error('Error updating request type with default workflow:', updateError);
          }
        }
        
        // Save steps with the new workflow ID
        const result = await saveWorkflowSteps(steps, data.id);
        return result.success;
      } else {
        // Save steps with existing workflow ID
        const result = await saveWorkflowSteps(steps, workflowId);
        return result.success;
      }
    } catch (err) {
      console.error('Error saving workflow steps:', err);
      setError(err instanceof Error ? err : new Error('Failed to save workflow steps'));
      toast.error('Failed to save workflow steps');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    workflowSteps,
    currentStep,
    editingStepIndex,
    users,
    isLoading,
    error,
    setCurrentStep,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep,
    saveWorkflowSteps: saveSteps,
    resetWorkflowState,
    workflowId
  };
};
