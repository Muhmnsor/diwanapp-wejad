
import { WorkflowStep } from "../types";

// Define a consistent initial state for a new workflow step
export const getInitialStepState = (stepOrder: number, workflowId: string): WorkflowStep => {
  return {
    id: null,
    workflow_id: workflowId,
    step_order: stepOrder,
    step_name: "",
    step_type: "decision",
    approver_id: "",
    approver_type: "user",
    instructions: null,
    is_required: true,
    created_at: null
  };
};

// Validate if a step has all required fields before saving
export const isStepValid = (step: WorkflowStep): boolean => {
  return !!(
    step.step_name && 
    step.step_name.trim() !== '' && 
    step.approver_id && 
    step.approver_id.trim() !== '' &&
    step.workflow_id
  );
};
