
import { WorkflowStep, User } from "../types";

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

/**
 * Get the display name of an approver based on the step configuration
 * @param step The workflow step
 * @param users List of users to search for the approver
 * @returns Display name of the approver or placeholder text
 */
export const getApproverName = (step: WorkflowStep, users: User[]): string => {
  if (!step.approver_id) {
    return "غير محدد";
  }

  if (step.approver_type === "user") {
    const user = users.find(u => u.id === step.approver_id);
    return user ? user.display_name : "مستخدم غير موجود";
  } else if (step.approver_type === "role") {
    // For now just return the role name (future: could map to actual role names)
    return "دور: " + step.approver_id;
  } else if (step.approver_type === "department") {
    // For now just return the department name (future: could map to actual department names)
    return "قسم: " + step.approver_id;
  }

  return "غير معروف";
};

/**
 * Get display label for a workflow step type
 * @param stepType The type of workflow step
 * @returns Localized label for the step type
 */
export const getStepTypeLabel = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'قرار';
    case 'opinion':
      return 'رأي';
    case 'review':
      return 'مراجعة';
    case 'approval':
      return 'موافقة';
    case 'notification':
      return 'إشعار';
    default:
      return stepType;
  }
};

/**
 * Get the appropriate CSS class for styling a step type badge
 * @param stepType The type of workflow step
 * @returns Tailwind CSS class string for the badge
 */
export const getStepTypeBadgeClass = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'opinion':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'review':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'approval':
      return 'bg-green-50 text-green-600 border-green-200';
    case 'notification':
      return 'bg-gray-50 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-800 border-gray-200';
  }
};
