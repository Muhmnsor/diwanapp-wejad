
import { useState, useCallback } from "react";
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
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(
    initialSteps.map(step => ({
      ...step,
      workflow_id: step.workflow_id || initialWorkflowId || 'temp-workflow-id'
    }))
  );
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(
    getInitialStepState(initialSteps.length + 1, initialWorkflowId || 'temp-workflow-id')
  );
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(initialSteps.length > 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe update for workflow steps to ensure workflow_id is always set
  const safeSetWorkflowSteps = useCallback((steps: WorkflowStep[]) => {
    console.log("Setting workflow steps with current workflowId:", workflowId);
    const updatedSteps = steps.map(step => ({
      ...step,
      workflow_id: step.workflow_id || workflowId || 'temp-workflow-id'
    }));
    setWorkflowSteps(updatedSteps);
  }, [workflowId]);

  // Safe update for current step to ensure workflow_id is always set
  const safeSetCurrentStep = useCallback((step: WorkflowStep) => {
    console.log("Setting current step with current workflowId:", workflowId);
    setCurrentStep({
      ...step,
      workflow_id: step.workflow_id || workflowId || 'temp-workflow-id'
    });
  }, [workflowId]);

  // Safe update for workflow ID that also updates all steps with the new ID
  const safeSetWorkflowId = useCallback((id: string | null) => {
    console.log("Setting workflow ID:", id);
    setWorkflowId(id);
    
    if (id) {
      // Update all workflow steps with the new ID
      setWorkflowSteps(prevSteps => 
        prevSteps.map(step => ({
          ...step,
          workflow_id: id
        }))
      );
      
      // Update current step with the new ID
      setCurrentStep(prevStep => ({
        ...prevStep,
        workflow_id: id
      }));
    }
  }, []);

  return {
    workflowId,
    setWorkflowId: safeSetWorkflowId,
    workflowSteps,
    setWorkflowSteps: safeSetWorkflowSteps,
    currentStep,
    setCurrentStep: safeSetCurrentStep,
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
