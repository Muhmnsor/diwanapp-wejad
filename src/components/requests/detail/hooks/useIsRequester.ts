
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user is the requester of a request
 * @param requesterId The ID of the requester to check against
 * @returns Boolean indicating if current user is the requester
 */
export const useIsRequester = (requesterId?: string | null): boolean => {
  if (!requesterId) return false;
  
  const user = supabase.auth.getUser();
  const currentUserId = user?.data?.user?.id;
  
  return currentUserId === requesterId;
};
