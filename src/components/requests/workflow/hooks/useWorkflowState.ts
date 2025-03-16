
import { useState, useCallback } from 'react';
import { WorkflowStep } from '../../types';
import { v4 as uuidv4 } from 'uuid';

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

export const useWorkflowState = (initialConfig: { initialSteps?: WorkflowStep[], initialWorkflowId?: string | null } = {}) => {
  const { initialSteps = [], initialWorkflowId = null } = initialConfig;
  
  const [workflowId, setWorkflowId] = useState<string | null>(initialWorkflowId || 'temp-workflow-id');
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(DEFAULT_EMPTY_STEP);
  const [editingStep, setEditingStep] = useState<WorkflowStep>(DEFAULT_EMPTY_STEP);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const resetWorkflowState = () => {
    setWorkflowId('temp-workflow-id');
    setSteps([]);
    setWorkflowSteps([]);
    setCurrentStep(DEFAULT_EMPTY_STEP);
    setEditingStep(DEFAULT_EMPTY_STEP);
    setEditingStepIndex(null);
    setInitialized(false);
    setIsLoading(false);
    setError(null);
  };

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
    workflowId,
    setWorkflowId,
    steps,
    setSteps,
    workflowSteps,
    setWorkflowSteps,
    currentStep,
    setCurrentStep,
    editingStep,
    editingStepIndex,
    setEditingStepIndex,
    isDialogOpen,
    setIsDialogOpen,
    isConfirmDeleteOpen,
    setIsConfirmDeleteOpen,
    initialized,
    setInitialized,
    isLoading,
    setIsLoading,
    error,
    setError,
    addStep,
    editStep,
    saveStep,
    removeStep,
    confirmDelete,
    reorderSteps,
    resetWorkflowState
  };
};
