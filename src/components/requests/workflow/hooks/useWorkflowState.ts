
import { useState } from "react";
import { WorkflowStep } from "../../types";

interface UseWorkflowStateProps {
  initialSteps?: WorkflowStep[];
  initialWorkflowId?: string | null;
}

export const useWorkflowState = ({ 
  initialSteps = [],
  initialWorkflowId = null
}: UseWorkflowStateProps) => {
  // Workflow ID management
  const [workflowId, setWorkflowId] = useState<string>(initialWorkflowId || 'temp-workflow-id');
  
  // Workflow steps management
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(initialSteps || []);
  
  // Current step being edited
  const [currentStep, setCurrentStep] = useState<WorkflowStep>({
    step_name: '',
    step_type: 'decision',
    approver_id: '',
    is_required: true,
    workflow_id: workflowId,
    step_order: 1
  });
  
  // Index of the step being edited (null if adding a new step)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialization state
  const [initialized, setInitialized] = useState(false);
  
  // Reset the workflow state
  const resetWorkflowState = () => {
    setWorkflowSteps([]);
    setCurrentStep({
      step_name: '',
      step_type: 'decision',
      approver_id: '',
      is_required: true,
      workflow_id: workflowId,
      step_order: 1
    });
    setEditingStepIndex(null);
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
