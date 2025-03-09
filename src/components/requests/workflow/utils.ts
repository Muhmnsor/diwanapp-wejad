
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

// Add the missing utility functions for step type labels and badge classes
export const getStepTypeLabel = (step_type: string): string => {
  switch (step_type) {
    case 'opinion':
      return 'رأي';
    case 'decision':
      return 'قرار';
    default:
      return 'غير محدد';
  }
};

export const getStepTypeBadgeClass = (step_type: string): string => {
  switch (step_type) {
    case 'opinion':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'decision':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};
