
import { WorkflowStep, User } from "../types";

export const getInitialStepState = (stepOrder: number): WorkflowStep => {
  return {
    step_order: stepOrder,
    step_name: "",
    step_type: "opinion",
    approver_type: "user",
    approver_id: null,
    instructions: null,
    is_required: true
  };
};

export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) return "غير محدد";
  
  const approver = users.find(user => user.id === step.approver_id);
  return approver ? approver.display_name || approver.email || 'غير محدد' : 'غير محدد';
};
