
import { WorkflowStep, User } from "../types";

export const getInitialStepState = (step_order: number): WorkflowStep => ({
  id: null, // Will be assigned by the database
  workflow_id: null, // Will be assigned when saving
  step_order: step_order,
  step_name: "",
  step_type: "opinion",
  approver_id: null,
  approver_type: "user",
  instructions: "",
  is_required: true,
  created_at: null
});

export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) return 'غير محدد';
  
  const user = users.find(u => u.id === step.approver_id);
  return user ? user.display_name : 'غير معروف';
};
