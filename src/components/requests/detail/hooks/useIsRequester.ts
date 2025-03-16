
import { useAuthStore } from "@/store/refactored-auth";

/**
 * Hook to determine if the current user is the requester of a request
 * 
 * @param requesterId - The ID of the requester to compare with the current user
 * @returns boolean indicating if the current user is the requester
 */
export const useIsRequester = (requesterId?: string): boolean => {
  const { user } = useAuthStore();
  
  if (!user || !requesterId) {
    return false;
  }
  
  return user.id === requesterId;
};
