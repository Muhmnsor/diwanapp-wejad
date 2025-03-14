
/**
 * Validates if a string is a valid UUID
 * @param str String to validate as UUID
 * @returns Boolean indicating if the string is a valid UUID
 */
export const isValidUUID = (str: string | null | undefined): boolean => {
  if (!str) return false;
  
  // Regular expression for UUIDs like 550e8400-e29b-41d4-a716-446655440000
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Creates a utility to check permissions for current user
 */
export const checkUserPermissions = async () => {
  const { data: sessionData } = await fetch('/api/check-admin-permissions');
  return sessionData;
};
