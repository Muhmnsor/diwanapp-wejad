
import { useState, useCallback } from 'react';
import { WorkflowStep } from '../../types';

// Define a default empty step
const DEFAULT_EMPTY_STEP: WorkflowStep = {
  id: '',
  step_name: '',
  step_type: 'decision',
  approver_id: null,
  is_required: true,
  step_order: 0,
  instructions: null,
  workflow_id: ''
};

export const useWorkflowState = (initialSteps: WorkflowStep[] = []) => {
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [editingStep, setEditingStep] = useState<WorkflowStep>(DEFAULT_EMPTY_STEP);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  const addStep = useCallback(() => {
    const nextOrder = steps.length > 0 
      ? Math.max(...steps.map(s => s.step_order || 0)) + 1 
      : 0;
    
    setEditingStep({
      ...DEFAULT_EMPTY_STEP,
      step_order: nextOrder
    });
    setIsDialogOpen(true);
  }, [steps]);

  const editStep = useCallback((step: WorkflowStep) => {
    setEditingStep(step);
    setIsDialogOpen(true);
  }, []);

  const saveStep = useCallback((step: WorkflowStep) => {
    setSteps(currentSteps => {
      // Check if we're editing an existing step or adding a new one
      const existingIndex = currentSteps.findIndex(s => s.id === step.id);
      
      if (existingIndex >= 0) {
        // Update existing step
        const newSteps = [...currentSteps];
        newSteps[existingIndex] = step;
        return newSteps;
      } else {
        // Add new step
        return [...currentSteps, step];
      }
    });
    
    setIsDialogOpen(false);
    setEditingStep(DEFAULT_EMPTY_STEP);
  }, []);

  const removeStep = useCallback((stepId: string) => {
    setSteps(steps => steps.filter(step => step.id !== stepId));
    setIsConfirmDeleteOpen(false);
  }, []);

  const confirmDelete = useCallback((step: WorkflowStep) => {
    setEditingStep(step);
    setIsConfirmDeleteOpen(true);
  }, []);

  const reorderSteps = useCallback((newOrder: WorkflowStep[]) => {
    // Update step_order to match the new array order
    const reorderedSteps = newOrder.map((step, index) => ({
      ...step,
      step_order: index
    }));
    
    setSteps(reorderedSteps);
  }, []);

  return {
    steps,
    setSteps,
    editingStep,
    isDialogOpen,
    setIsDialogOpen,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    addStep,
    editStep,
    saveStep,
    removeStep,
    confirmDelete,
    reorderSteps
  };
};
