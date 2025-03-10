
import { useEffect } from "react";
import { WorkflowStep } from "../../types";
import { getInitialStepState } from "../utils";

interface UseWorkflowInitializationProps {
  requestTypeId: string | null;
  initialSteps: WorkflowStep[];
  initialWorkflowId: string | null;
  workflowId: string | null;
  initialized: boolean;
  setWorkflowId: (id: string | null) => void;
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
    if ((initialSteps && initialSteps.length > 0 && !initialized) || 
        (initialWorkflowId && !initialized)) {
      console.log("Initializing workflow steps with:", { 
        initialSteps, 
        initialWorkflowId 
      });
      
      const effectiveWorkflowId = initialWorkflowId || 
                                  (initialSteps[0]?.workflow_id) || 
                                  'temp-workflow-id';
      
      console.log("Using workflow ID for initialization:", effectiveWorkflowId);
      
      const stepsWithWorkflowId = initialSteps.map(step => ({
        ...step,
        workflow_id: step.workflow_id || effectiveWorkflowId
      }));
      
      setWorkflowSteps(stepsWithWorkflowId);
      setCurrentStep({
        ...getInitialStepState(initialSteps.length + 1),
        workflow_id: effectiveWorkflowId
      });
      
      setWorkflowId(effectiveWorkflowId);
      setInitialized(true);
    }
  }, [initialSteps, initialWorkflowId, initialized, setCurrentStep, setInitialized, setWorkflowId, setWorkflowSteps]);
};
