
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to check if the current user is the requester of a request
 * @param requesterId The ID of the requester to check against
 * @returns Boolean indicating if current user is the requester
 */
export const useIsRequester = (requesterId?: string | null): boolean => {
  const [isRequester, setIsRequester] = useState(false);
  
  useEffect(() => {
    const checkUser = async () => {
      if (!requesterId) {
        setIsRequester(false);
        return;
      }
      
      const { data } = await supabase.auth.getUser();
      const currentUserId = data?.user?.id;
      
      setIsRequester(currentUserId === requesterId);
    };
    
    checkUser();
  }, [requesterId]);
  
  return isRequester;
};
