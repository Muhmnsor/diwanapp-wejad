
/**
 * Validates if a string is a valid UUID v4 format
 * @param str The string to check
 * @returns True if the string is a valid UUID
 */
export const isValidUUID = (str: string): boolean => {
  if (!str) return false;
  
  // Regular expression pattern for UUID v4
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidPattern.test(str);
};
