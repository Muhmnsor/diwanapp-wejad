
/**
 * Validates if a string is a valid UUID
 * @param str String to validate as UUID
 * @returns boolean indicating if the string is a valid UUID
 */
export const isValidUUID = (str: string | null | undefined): boolean => {
  if (!str) return false;
  
  // Regular expression for validating UUID
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(str);
};

/**
 * Validates a workflow step to ensure all required fields are present
 * @param step Workflow step to validate
 * @returns Object containing validation result and error message
 */
export const validateWorkflowStep = (step: any) => {
  if (!step) {
    return { valid: false, error: 'خطوة سير العمل غير محددة' };
  }
  
  if (!step.step_name) {
    return { valid: false, error: 'اسم الخطوة مطلوب' };
  }
  
  if (!step.approver_id) {
    return { valid: false, error: 'معرّف المعتمد مطلوب' };
  }
  
  if (!isValidUUID(step.approver_id)) {
    return { valid: false, error: 'معرّف المعتمد غير صالح' };
  }
  
  if (step.workflow_id && !isValidUUID(step.workflow_id)) {
    return { valid: false, error: 'معرّف سير العمل غير صالح' };
  }
  
  return { valid: true, error: null };
};
