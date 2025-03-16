
import { WorkflowStep } from "../types";
import { useUsersList } from "./hooks/useUsersList";
import { useWorkflowState } from "./hooks/useWorkflowState";
import { useWorkflowInitialization } from "./hooks/useWorkflowInitialization";
import { useWorkflowFetching } from "./hooks/useWorkflowFetching";
import { useWorkflowOperations } from "./hooks/useWorkflowOperations";

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
  
  // State management for workflow steps
  const {
    workflowId,
    setWorkflowId,
    workflowSteps,
    setWorkflowSteps,
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
  } = useWorkflowState({ initialSteps, initialWorkflowId });

  // Initialize with provided steps if available
  useWorkflowInitialization({
    requestTypeId,
    initialSteps,
    initialWorkflowId,
    workflowId,
    initialized,
    setWorkflowId,
    setWorkflowSteps,
    setCurrentStep,
    setInitialized
  });

  // Fetch workflow steps from the database
  useWorkflowFetching({
    requestTypeId,
    workflowId,
    initialSteps,
    initialized,
    setWorkflowId,
    setWorkflowSteps,
    setCurrentStep,
    setInitialized,
    setIsLoading,
    setError
  });

  // Operations on workflow steps
  const {
    updateWorkflowSteps,
    saveWorkflowSteps,
    handleAddStep: addStep,
    handleRemoveStep: removeStep,
    handleEditStep: editStep,
    handleMoveStep: moveStep
  } = useWorkflowOperations({
    requestTypeId,
    workflowId,
    setWorkflowId,
    setWorkflowSteps,
    setCurrentStep,
    setEditingStepIndex,
    setIsLoading,
    setError,
    onWorkflowStepsUpdated
  });

  // Create handlers that use the current state
  const handleAddStep = () => {
    addStep(currentStep, workflowSteps, editingStepIndex);
  };

  const handleRemoveStep = (index: number) => {
    removeStep(index, workflowSteps, editingStepIndex);
  };

  const handleEditStep = (index: number) => {
    editStep(index, workflowSteps);
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    moveStep(index, direction, workflowSteps, editingStepIndex);
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
    saveWorkflowSteps,
    resetWorkflowState,
    workflowId
  };
};
