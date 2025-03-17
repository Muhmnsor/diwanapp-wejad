
import { useRequestDetail } from "@/components/requests/detail/useRequestDetail";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/refactored-auth";

/**
 * Enhanced version of useRequestDetail that adds isRequester functionality
 * without modifying the protected system file
 */
export const useRequestDetailEnhanced = (requestId: string) => {
  const originalHook = useRequestDetail(requestId);
  const { user } = useAuthStore();
  
  // Function to check if current user is the requester
  const isRequester = () => {
    if (!user || !originalHook.data || !originalHook.data.request) {
      return false;
    }
    
    return originalHook.data.request.requester_id === user.id;
  };
  
  return {
    ...originalHook,
    isRequester,
  };
};
