
import { WorkflowStep } from "../types";

export const getInitialStepState = (stepOrder: number): WorkflowStep => {
  return {
    id: null,
    workflow_id: "",  // This will be set by the useWorkflowSteps hook
    step_order: stepOrder,
    step_name: "",
    step_type: "decision",
    approver_id: null,
    approver_type: "user",
    instructions: null,
    is_required: true,
    created_at: null
  };
};
