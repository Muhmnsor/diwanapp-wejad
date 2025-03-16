
import { useCallback } from "react";
import { WorkflowStep } from "../../types";
import { useAddStep } from "./operations/useAddStep";
import { useRemoveStep } from "./operations/useRemoveStep";
import { useEditStep } from "./operations/useEditStep";
import { useMoveStep } from "./operations/useMoveStep";
import { useSaveWorkflowSteps } from "./useSaveWorkflowSteps";
import { useEnsureWorkflowExists } from "./useEnsureWorkflowExists";
import { useUpdateDefaultWorkflow } from "./useUpdateDefaultWorkflow";

interface UseWorkflowOperationsProps {
  requestTypeId: string | null;
  workflowId: string | null;
  setWorkflowId: (id: string) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setEditingStepIndex: (index: number | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
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
  // Function to update workflow steps and notify parent component if needed
  const updateWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    setWorkflowSteps(steps);
    if (onWorkflowStepsUpdated) {
      onWorkflowStepsUpdated(steps);
    }
  }, [setWorkflowSteps, onWorkflowStepsUpdated]);

  // Ensure a workflow exists for saving steps
  const { ensureWorkflowExists } = useEnsureWorkflowExists({
    requestTypeId,
    workflowId,
    setWorkflowId,
    setIsLoading,
    setError
  });

  // Update the default workflow for a request type
  const { updateDefaultWorkflow } = useUpdateDefaultWorkflow({
    setIsLoading,
    setError
  });

  // Save workflow steps to the database
  const { saveWorkflowSteps } = useSaveWorkflowSteps({
    requestTypeId,
    workflowId,
    setIsLoading,
    setError,
    updateWorkflowSteps,
    ensureWorkflowExists,
    updateDefaultWorkflow
  });

  // Step operations
  const { handleAddStep } = useAddStep(saveWorkflowSteps, setCurrentStep, setEditingStepIndex);
  const { handleRemoveStep } = useRemoveStep(saveWorkflowSteps, setCurrentStep, setEditingStepIndex);
  const { handleEditStep } = useEditStep(setCurrentStep, setEditingStepIndex);
  const { handleMoveStep } = useMoveStep(saveWorkflowSteps, setEditingStepIndex);

  return {
    updateWorkflowSteps,
    saveWorkflowSteps,
    handleAddStep: (currentStep: WorkflowStep, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => 
      handleAddStep(currentStep, workflowSteps, editingStepIndex, workflowId),
    handleRemoveStep: (index: number, workflowSteps: WorkflowStep[], editingStepIndex: number | null) => 
      handleRemoveStep(index, workflowSteps, editingStepIndex, workflowId),
    handleEditStep: (index: number, workflowSteps: WorkflowStep[]) => 
      handleEditStep(index, workflowSteps, workflowId),
    handleMoveStep: (index: number, direction: 'up' | 'down', workflowSteps: WorkflowStep[], editingStepIndex: number | null) => 
      handleMoveStep(index, direction, workflowSteps, editingStepIndex, workflowId)
  };
};
