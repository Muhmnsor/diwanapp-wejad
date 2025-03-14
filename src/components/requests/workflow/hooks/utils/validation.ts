
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

/**
 * Checks if an API endpoint is available
 * @param url The URL to check
 * @returns Promise resolving to boolean indicating if the endpoint is available
 */
export const checkEndpointAvailability = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: { 'Content-Type': 'application/json' }
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error checking endpoint availability:", error);
    return false;
  }
};

/**
 * Parse error message from Supabase RPC calls
 * @param error The error response from Supabase
 * @returns A user-friendly error message
 */
export const parseRPCErrorMessage = (error: any): string => {
  if (!error) return "حدث خطأ غير معروف";
  
  // Check for specific error code patterns in the message
  if (error.message && error.message.includes("FK_")) {
    if (error.message.includes("request_workflows")) {
      return "لا يمكن حذف نوع الطلب لأنه مرتبط بمسارات سير عمل. قم بحذف مسارات سير العمل أولاً.";
    }
    if (error.message.includes("requests")) {
      return "لا يمكن حذف نوع الطلب لأنه مرتبط بطلبات موجودة.";
    }
  }
  
  return error.message || "حدث خطأ أثناء تنفيذ العملية";
};
