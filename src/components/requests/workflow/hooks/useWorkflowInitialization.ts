
import { useEffect } from "react";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";

interface UseWorkflowInitializationProps {
  requestTypeId: string | null;
  initialSteps: WorkflowStep[];
  initialWorkflowId: string | null;
  workflowId: string;
  initialized: boolean;
  setWorkflowId: (id: string) => void;
  setWorkflowSteps: (steps: WorkflowStep[]) => void;
  setCurrentStep: (step: WorkflowStep) => void;
  setInitialized: (value: boolean) => void;
}

export const useWorkflowInitialization = ({
  requestTypeId,
  initialSteps,
  initialWorkflowId,
  workflowId,
  initialized,
  setWorkflowId,
  setWorkflowSteps,
  setCurrentStep,
  setInitialized
}: UseWorkflowInitializationProps) => {
  // Initialize with provided steps if available
  useEffect(() => {
    // Skip if already initialized or if there are no initial steps
    if (initialized || (initialSteps.length === 0 && !initialWorkflowId)) {
      return;
    }
    
    console.log("Initializing workflow with:", { 
      initialSteps: initialSteps.length, 
      initialWorkflowId
    });
    
    // If we have a workflow ID, use it
    if (initialWorkflowId && initialWorkflowId !== 'temp-workflow-id') {
      setWorkflowId(initialWorkflowId);
    }
    
    // If we have initial steps, use them
    if (initialSteps.length > 0) {
      // Ensure all steps have the workflow_id set
      const stepsWithWorkflowId = initialSteps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || workflowId
      }));
      
      setWorkflowSteps(stepsWithWorkflowId);
      
      // Set current step to be the next in sequence
      setCurrentStep(getInitialStepState(stepsWithWorkflowId.length + 1, workflowId));
    }
    
    setInitialized(true);
  }, [
    initialSteps, 
    initialWorkflowId, 
    workflowId, 
    initialized, 
    setWorkflowId, 
    setWorkflowSteps, 
    setCurrentStep, 
    setInitialized
  ]);
};
