
import { useState, useEffect } from "react";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";

interface UseWorkflowStateProps {
  initialSteps?: WorkflowStep[];
  initialWorkflowId?: string | null;
}

export const useWorkflowState = ({ 
  initialSteps = [], 
  initialWorkflowId = null 
}: UseWorkflowStateProps) => {
  // Ensure initialSteps is always an array
  const safeInitialSteps = Array.isArray(initialSteps) ? initialSteps : [];
  
  // Always set a valid workflow ID, even if it's temporary
  const defaultWorkflowId = initialWorkflowId || 
    (safeInitialSteps.length > 0 && safeInitialSteps[0]?.workflow_id) || 
    'temp-workflow-id';
  
  // Ensure all steps have a workflow_id
  const processedInitialSteps = safeInitialSteps.map(step => ({
    ...step,
    workflow_id: step.workflow_id || defaultWorkflowId
  }));
  
  const [workflowId, setWorkflowId] = useState<string | null>(defaultWorkflowId);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(processedInitialSteps);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(
    processedInitialSteps.length + 1, 
    defaultWorkflowId
  ));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(processedInitialSteps.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log("[useWorkflowState] Initial state:", {
    workflowId,
    stepsCount: workflowSteps.length,
    initialized
  });

  useEffect(() => {
    // Log state changes for debugging
    console.log("[useWorkflowState] State updated:", {
      workflowId,
      stepsCount: workflowSteps.length,
      initialized
    });
  }, [workflowId, workflowSteps, initialized]);

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
    setError
  };
};
