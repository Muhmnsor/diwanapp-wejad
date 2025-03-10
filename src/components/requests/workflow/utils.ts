
import { WorkflowStep, User } from "../types";

export const getInitialStepState = (stepOrder: number, workflowId: string = ""): WorkflowStep => {
  return {
    id: null,
    workflow_id: workflowId,
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

export const getStepTypeLabel = (stepType?: string): string => {
  switch (stepType) {
    case "decision":
      return "قرار";
    case "opinion":
      return "رأي";
    default:
      return stepType || "غير محدد";
  }
};

export const getStepTypeBadgeClass = (stepType?: string): string => {
  switch (stepType) {
    case "decision":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "opinion":
      return "bg-green-50 text-green-600 border-green-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};

export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) return "غير محدد";
  
  const user = users.find(u => u.id === step.approver_id);
  return user ? (user.display_name || user.email || "مستخدم") : "غير موجود";
};
