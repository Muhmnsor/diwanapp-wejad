
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
    if (initialized) {
      console.log("Workflow already initialized, skipping initialization");
      return;
    }

    console.log("Initializing workflow with:", {
      requestTypeId,
      initialSteps: initialSteps.length,
      initialWorkflowId,
      workflowId,
      initialized
    });

    try {
      if (initialSteps && initialSteps.length > 0) {
        console.log("Initializing with existing steps");
        
        const effectiveWorkflowId = initialWorkflowId || 
                                  (initialSteps[0]?.workflow_id) || 
                                  workflowId ||
                                  'temp-workflow-id';
        
        console.log("Using workflow ID for initialization:", effectiveWorkflowId);
        
        // Ensure all steps have a workflow_id
        const stepsWithWorkflowId = initialSteps.map(step => ({
          ...step,
          workflow_id: step.workflow_id || effectiveWorkflowId
        }));
        
        setWorkflowSteps(stepsWithWorkflowId);
        setCurrentStep({
          ...getInitialStepState(stepsWithWorkflowId.length + 1),
          workflow_id: effectiveWorkflowId
        });
        
        setWorkflowId(effectiveWorkflowId);
      } else if (initialWorkflowId) {
        console.log("Initializing with workflow ID but no steps");
        setWorkflowId(initialWorkflowId);
        setWorkflowSteps([]);
        setCurrentStep({
          ...getInitialStepState(1),
          workflow_id: initialWorkflowId
        });
      } else {
        console.log("Initializing with default values");
        const defaultWorkflowId = 'temp-workflow-id';
        setWorkflowId(defaultWorkflowId);
        setWorkflowSteps([]);
        setCurrentStep({
          ...getInitialStepState(1),
          workflow_id: defaultWorkflowId
        });
      }
      
      setInitialized(true);
      console.log("Workflow initialization complete");
    } catch (error) {
      console.error("Error during workflow initialization:", error);
    }
  }, [initialSteps, initialWorkflowId, workflowId, initialized, requestTypeId, 
      setWorkflowId, setWorkflowSteps, setCurrentStep, setInitialized]);
};
