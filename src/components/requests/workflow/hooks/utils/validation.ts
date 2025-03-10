
/**
 * Validates if a string is a valid UUID
 * @param uuid The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  // More strict UUID regex following RFC4122 format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates if a workflow step id is valid
 * @param id The id to validate
 * @returns True if the id is valid, false otherwise
 */
export const isValidStepId = (id: string | undefined | null): boolean => {
  if (!id) return false;
  return isValidUUID(id);
};

/**
 * Validates workflow steps to ensure they have consistent workflow_id values
 * @param steps The workflow steps to validate
 * @returns An object with the validation result and error message
 */
export const validateWorkflowSteps = (steps: any[]): { valid: boolean; error?: string } => {
  if (!steps || steps.length === 0) {
    return { valid: true };
  }

  // Check for first workflow_id
  const firstWorkflowId = steps[0]?.workflow_id;
  if (!firstWorkflowId || firstWorkflowId === 'temp-workflow-id' || !isValidUUID(firstWorkflowId)) {
    return { 
      valid: false, 
      error: 'معرف سير العمل غير صالح في الخطوة الأولى'
    };
  }

  // Check if all steps have the same workflow_id
  const inconsistentStep = steps.find(step => step.workflow_id !== firstWorkflowId);
  if (inconsistentStep) {
    return { 
      valid: false, 
      error: 'هناك اختلاف في معرفات سير العمل بين الخطوات'
    };
  }

  // Check step order
  let previousOrder = 0;
  for (const step of steps) {
    if (!step.step_order || typeof step.step_order !== 'number' || step.step_order <= previousOrder) {
      return { 
        valid: false, 
        error: 'ترتيب الخطوات غير صحيح'
      };
    }
    previousOrder = step.step_order;
  }

  return { valid: true };
};
