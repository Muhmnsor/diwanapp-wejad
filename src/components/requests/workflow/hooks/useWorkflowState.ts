
import { useState } from "react";
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
  const [workflowId, setWorkflowId] = useState<string | null>(initialWorkflowId || null);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps);
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(getInitialStepState(1, workflowId || ''));
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
