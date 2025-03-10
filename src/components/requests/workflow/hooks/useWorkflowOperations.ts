
import { useCallback } from "react";
import { WorkflowStep } from "../../types";
import { useWorkflowCreation } from "./useWorkflowCreation";
import { useSaveWorkflowSteps } from "./useSaveWorkflowSteps";
import { useStepManagement } from "./useStepManagement";

interface UseWorkflowOperationsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setWorkflowId: (id: string | null) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
  setIsLoading: (value: boolean) => void;
  setError: (value: string | null) => void;
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
  
  // Hook for updating workflow steps in the UI
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    console.log("Updating workflow steps locally:", steps);
    
    const currentWorkflowId = workflowId || 'temp-workflow-id';
    const stepsWithWorkflowId = steps.map(step => ({
      ...step,
      workflow_id: step.workflow_id || currentWorkflowId
    }));
    
    setWorkflowSteps(stepsWithWorkflowId);
    
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(stepsWithWorkflowId);
    }
  }, [onWorkflowStepsUpdated, workflowId, setWorkflowSteps]);

  // Hook for workflow creation and management
  const { 
    ensureWorkflowExists, 
    updateDefaultWorkflow 
  } = useWorkflowCreation({
    setWorkflowId,
    setError
  });

  // Hook for saving workflow steps
  const { 
    saveWorkflowSteps 
  } = useSaveWorkflowSteps({
    requestTypeId,
    workflowId,
    setIsLoading,
    setError,
    updateWorkflowSteps,
    ensureWorkflowExists: () => ensureWorkflowExists(requestTypeId, workflowId),
    updateDefaultWorkflow
  });

  // Hook for step management operations
  const { 
    handleAddStep: stepAddHandler,
    handleRemoveStep: stepRemoveHandler,
    handleEditStep: stepEditHandler,
    handleMoveStep: stepMoveHandler
  } = useStepManagement({
    saveWorkflowSteps,
    setCurrentStep,
    setEditingStepIndex
  });

  // Wrapper functions that provide the current context
  const handleAddStep = (currentStep: WorkflowStep, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
    stepAddHandler(currentStep, workflowSteps, editingStepIndex, workflowId);
  };

  const handleRemoveStep = (index: number, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
    stepRemoveHandler(index, workflowSteps, editingStepIndex, workflowId);
  };

  const handleEditStep = (index: number, workflowSteps: WorkflowStep[]) => {
    stepEditHandler(index, workflowSteps, workflowId);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down', workflowSteps: WorkflowStep[], editingStepIndex: number | null) => {
    stepMoveHandler(index, direction, workflowSteps, editingStepIndex, workflowId);
  };

  return {
    updateWorkflowSteps,
    saveWorkflowSteps,
    handleAddStep,
    handleRemoveStep,
    handleEditStep,
    handleMoveStep
  };
};
