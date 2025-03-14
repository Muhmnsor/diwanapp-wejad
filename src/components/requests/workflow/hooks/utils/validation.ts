
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
 * Checks user permissions for admin functionality by calling the API endpoint
 * @returns Promise that resolves to the permission check result
 */
export const checkUserPermissions = async (): Promise<{ session: any; isAdmin: boolean }> => {
  try {
    const response = await fetch('/api/check-admin-permissions');
    
    if (!response.ok) {
      console.error("Error checking permissions: HTTP status", response.status);
      return { session: null, isAdmin: false };
    }
    
    // Parse the JSON response before trying to access data
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Exception in checkUserPermissions:", error);
    return { session: null, isAdmin: false };
  }
};
