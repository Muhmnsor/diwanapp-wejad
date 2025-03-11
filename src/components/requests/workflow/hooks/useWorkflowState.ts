
import { useState } from "react";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";

interface UseWorkflowStateProps {
  initialSteps: WorkflowStep[];
  initialWorkflowId: string | null;
}

export const useWorkflowState = ({ 
  initialSteps = [],
  initialWorkflowId = null 
}: UseWorkflowStateProps) => {
  // Determine initial workflow ID (either provided or temporary)
  const initialId = initialWorkflowId || 'temp-workflow-id';
  
  // State for workflow steps
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps);
  const [workflowId, setWorkflowId] = useState<string>(initialId);
  
  // State for editing individual steps
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(
    getInitialStepState(workflowSteps.length + 1, initialId)
  );
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  
  // State for tracking initialization and loading
  const [initialized, setInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Reset the workflow state
  const resetWorkflowState = () => {
    setWorkflowSteps([]);
    setWorkflowId(initialId);
    setCurrentStep(getInitialStepState(1, initialId));
    setEditingStepIndex(null);
    setInitialized(false);
    setError(null);
  };
  
  return {
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
  };
};
