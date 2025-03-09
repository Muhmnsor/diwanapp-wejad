
import { User, WorkflowStep } from '../types';

// Helper function to get approver name by id
export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) return "غير محدد";
  
  const user = users.find(u => u.id === step.approver_id);
  return user ? (user.display_name || user.email || "غير محدد") : "غير محدد";
};

// Helper function to get step type label
export const getStepTypeLabel = (type: string): string => {
  const types: Record<string, string> = {
    opinion: "رأي",
    decision: "قرار"
  };
  return types[type] || type;
};

// Reset step form to initial state
export const getInitialStepState = (stepOrder: number): WorkflowStep => ({
  step_order: stepOrder,
  step_name: "",
  step_type: "opinion",
  approver_id: null,
  instructions: "",
  is_required: true,
});
