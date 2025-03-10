
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
    try {
      // Only initialize if not already initialized
      if (initialized) {
        console.log("[useWorkflowInitialization] Already initialized, skipping");
        return;
      }
      
      // Check if we have initial steps or a workflow ID to initialize with
      const hasInitialSteps = Array.isArray(initialSteps) && initialSteps.length > 0;
      
      if (hasInitialSteps || initialWorkflowId) {
        console.log("[useWorkflowInitialization] Initializing workflow steps with:", { 
          initialSteps: hasInitialSteps ? initialSteps.length : 0, 
          initialWorkflowId
        });
        
        // Determine the effective workflow ID to use
        const effectiveWorkflowId = initialWorkflowId || 
                                  (hasInitialSteps && initialSteps[0]?.workflow_id) || 
                                  'temp-workflow-id';
        
        console.log("[useWorkflowInitialization] Using workflow ID for initialization:", effectiveWorkflowId);
        
        // Safety check for initialSteps
        if (hasInitialSteps) {
          // Ensure all steps have the correct workflow_id
          const stepsWithWorkflowId = initialSteps.map(step => ({
            ...step,
            workflow_id: step.workflow_id || effectiveWorkflowId
          }));
          
          setWorkflowSteps(stepsWithWorkflowId);
          
          // Set up the next step with the correct order
          setCurrentStep({
            ...getInitialStepState(stepsWithWorkflowId.length + 1),
            workflow_id: effectiveWorkflowId
          });
        } else {
          // If no initial steps, set empty array
          setWorkflowSteps([]);
          
          // Set up the first step
          setCurrentStep({
            ...getInitialStepState(1),
            workflow_id: effectiveWorkflowId
          });
        }
        
        // Set the workflow ID and mark as initialized
        setWorkflowId(effectiveWorkflowId);
        setInitialized(true);
        
        console.log("[useWorkflowInitialization] Initialization complete");
      } else {
        console.log("[useWorkflowInitialization] No initial steps or workflow ID, using defaults");
        
        // Set defaults with empty array
        setWorkflowSteps([]);
        setCurrentStep({
          ...getInitialStepState(1),
          workflow_id: 'temp-workflow-id'
        });
        setWorkflowId('temp-workflow-id');
        setInitialized(true);
      }
    } catch (error) {
      console.error("[useWorkflowInitialization] Error during initialization:", error);
      // Set safe defaults on error
      setWorkflowSteps([]);
      setCurrentStep(getInitialStepState(1, 'temp-workflow-id'));
      setWorkflowId('temp-workflow-id');
      setInitialized(true);
    }
  }, [initialSteps, initialWorkflowId, initialized, setCurrentStep, setInitialized, setWorkflowId, setWorkflowSteps]);
};
