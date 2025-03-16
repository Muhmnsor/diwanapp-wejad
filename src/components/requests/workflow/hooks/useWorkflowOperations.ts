
import { useState, useCallback } from 'react';
import { WorkflowStep } from '../../types';
import { supabase } from '@/integrations/supabase/client';
import { useSaveWorkflowSteps } from './useSaveWorkflowSteps';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface UseWorkflowOperationsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;
  onWorkflowStepsUpdated?: (steps: WorkflowStep[]) => void;
}

export const useWorkflowOperations = ({
  requestTypeId,
  workflowId,
  setWorkflowId,
  setWorkflowSteps,
  setCurrentStep,
  setEditingStepIndex,
  setIsLoading,
  setError,
  onWorkflowStepsUpdated
}: UseWorkflowOperationsProps) => {
  const { saveWorkflowSteps } = useSaveWorkflowSteps();

  // Update workflow steps (local state only)
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(steps);
    }
  }, [setWorkflowSteps, onWorkflowStepsUpdated]);

  // Save workflow steps to the database
  const saveWorkflowStepsToDb = async (steps: WorkflowStep[]) => {
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

  // Add a new step
  const handleAddStep = useCallback((
    currentStep: WorkflowStep | null, 
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null
  ) => {
    if (editingStepIndex !== null) {
      // Update existing step
      const updatedSteps = [...workflowSteps];
      updatedSteps[editingStepIndex] = currentStep || updatedSteps[editingStepIndex];
      setWorkflowSteps(updatedSteps);
      setEditingStepIndex(null);
    } else if (currentStep) {
      // Add new step
      const newStep = {
        ...currentStep,
        id: currentStep.id || uuidv4(),
        workflow_id: workflowId || 'temp-workflow-id',
        step_order: workflowSteps.length
      };
      
      const updatedSteps = [...workflowSteps, newStep];
      setWorkflowSteps(updatedSteps);
    }

    // Reset current step
    setCurrentStep({
      id: uuidv4(),
      step_name: '',
      step_type: 'decision',
      approver_id: null,
      approver_name: null,
      is_required: true,
      step_order: workflowSteps.length,
      instructions: null,
      workflow_id: workflowId || 'temp-workflow-id'
    });
  }, [workflowId, setWorkflowSteps, setCurrentStep, setEditingStepIndex]);

  // Remove a step
  const handleRemoveStep = useCallback((
    index: number, 
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null
  ) => {
    // Skip if trying to remove the step currently being edited
    if (index === editingStepIndex) {
      setEditingStepIndex(null);
    }
    
    const updatedSteps = workflowSteps.filter((_, i) => i !== index);
    
    // Fix step order
    const reorderedSteps = updatedSteps.map((step, newIdx) => ({
      ...step,
      step_order: newIdx
    }));
    
    setWorkflowSteps(reorderedSteps);
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(reorderedSteps);
    }
  }, [setWorkflowSteps, setEditingStepIndex, onWorkflowStepsUpdated]);

  // Edit a step
  const handleEditStep = useCallback((
    index: number, 
    workflowSteps: WorkflowStep[]
  ) => {
    if (index >= 0 && index < workflowSteps.length) {
      setCurrentStep(workflowSteps[index]);
      setEditingStepIndex(index);
    }
  }, [setCurrentStep, setEditingStepIndex]);

  // Move a step
  const handleMoveStep = useCallback((
    index: number, 
    direction: 'up' | 'down', 
    workflowSteps: WorkflowStep[],
    editingStepIndex: number | null
  ) => {
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
    
    // Update editing index if we're moving the step being edited
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(reorderedSteps);
    }
  }, [setWorkflowSteps, setEditingStepIndex, onWorkflowStepsUpdated]);

  return {
    updateWorkflowSteps,
    saveWorkflowSteps: saveWorkflowStepsToDb,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
