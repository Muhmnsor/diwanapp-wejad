
import { useAuthStore } from "@/store/refactored-auth";

/**
 * Hook to check if the current user is the requester of a request
 * @param requesterId The ID of the requester
 * @returns Boolean indicating if the current user is the requester
 */
export const useIsRequester = (requesterId?: string): boolean => {
  const { user } = useAuthStore();
  
  if (!requesterId || !user) {
    return false;
  }
  
  return requesterId === user.id;
};
