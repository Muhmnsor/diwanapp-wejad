
// Utility functions for workflow components

/**
 * Returns a human-readable label for a step type
 */
export const getStepTypeLabel = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'موافقة';
    case 'review':
      return 'مراجعة';
    case 'signature':
      return 'توقيع';
    case 'notification':
      return 'إشعار';
    case 'approval':
      return 'اعتماد';
    default:
      return 'إجراء';
  }
};

/**
 * Returns the appropriate CSS class for a step type badge
 */
export const getStepTypeBadgeClass = (stepType: string): string => {
  switch (stepType) {
    case 'decision':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'review':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'signature':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'notification':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'approval':
      return 'bg-green-50 text-green-700 border-green-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

/**
 * Returns a formatted approver name from a step and users list
 */
export const getApproverName = (step: any, users: any[]): string => {
  if (!step.approver_id || !users || users.length === 0) {
    return 'غير محدد';
  }

  const approver = users.find(user => user.id === step.approver_id);
  return approver ? (approver.display_name || approver.email || 'مستخدم') : 'غير محدد';
};

/**
 * Returns an initial step state object for a new workflow step
 */
export const getInitialStepState = (stepOrder: number, workflowId: string | null): any => {
  return {
    step_name: '',
    step_type: 'approval',
    step_order: stepOrder,
    workflow_id: workflowId || 'temp-workflow-id',
    approver_id: null,
    is_required: true,
    instructions: '',
    timeout_days: 3,
    reminder_days: 1,
    custom_properties: {}
  };
};
