
import { WorkflowStep } from "../types";

export const getInitialStepState = (stepOrder: number): WorkflowStep => ({
  id: null,
  workflow_id: 'temp-workflow-id', // Add default temp workflow ID
  step_order: stepOrder,
  step_name: '',
  step_type: 'decision',
  approver_id: null,
  approver_type: 'user',
  instructions: null,
  is_required: true,
  created_at: null
});
