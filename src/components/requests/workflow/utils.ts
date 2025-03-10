
import { WorkflowStep } from "../types";
import { User } from "../types";

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

// Function to get the display label for the step type
export const getStepTypeLabel = (stepType: string | undefined): string => {
  switch (stepType) {
    case 'decision':
      return 'اعتماد';
    case 'opinion':
      return 'رأي';
    default:
      return 'غير محدد';
  }
};

// Function to get the badge CSS class based on step type
export const getStepTypeBadgeClass = (stepType: string | undefined): string => {
  switch (stepType) {
    case 'decision':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'opinion':
      return 'bg-green-50 text-green-600 border-green-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
};

// Function to get the approver name from a list of users
export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) {
    return 'غير محدد';
  }
  
  const approver = users.find(user => user.id === step.approver_id);
  
  if (approver) {
    return approver.display_name || approver.email || 'مستخدم';
  }
  
  return step.approver_type === 'role' ? 'دور وظيفي' : 'غير محدد';
};
