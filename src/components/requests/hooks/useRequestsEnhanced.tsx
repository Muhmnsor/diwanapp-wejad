
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useRequests } from "./useRequests";
import { RequestStatus } from "@/types/meeting";

/**
 * Enhanced version of useRequests that adds additional functionality
 * without modifying the original protected file
 */
export const useRequestsEnhanced = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const requests = useRequests();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Monitor URL changes to trigger refreshes
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    
    // Handle refresh tabs
    if (tabFromUrl?.endsWith("-refresh")) {
      console.log("Detected refresh tab, will switch back shortly");
      
      // Switch back to the original tab after a short delay
      const originalTab = tabFromUrl.replace("-refresh", "");
      setTimeout(() => {
        searchParams.set("tab", originalTab);
        setSearchParams(searchParams);
        
        // Set refreshing state to false after the tab has switched back
        setIsRefreshing(false);
      }, 200);
    }
  }, [searchParams, setSearchParams]);

  // Enhance the createRequest mutation with better error handling
  const enhancedCreateRequest = {
    ...requests.createRequest,
    mutate: (formData: any, options?: any) => {
      console.log("Enhanced request submission:", formData);
      
      // Set refreshing state to true
      setIsRefreshing(true);
      
      // Log workflow ID if present for debugging
      if (formData.workflow_id) {
        console.log("Request has workflow_id:", formData.workflow_id);
      } else if (formData.request_type_id) {
        console.log("Request has request_type_id but no workflow_id");
      }
      
      // Ensure the status field is a valid RequestStatus type if it exists
      if (formData.status && typeof formData.status === 'string') {
        const validStatuses: RequestStatus[] = ['pending', 'in_progress', 'approved', 'rejected', 'completed', 'cancelled'];
        if (!validStatuses.includes(formData.status as RequestStatus)) {
          formData.status = 'pending' as RequestStatus;
        }
      }
      
      // Call the original mutate function with enhanced options
      return requests.createRequest.mutate(formData, {
        ...options,
        onError: (error: any) => {
          console.error("Enhanced error handling - Error creating request:", error);
          setIsRefreshing(false);
          
          // Call the original onError if provided
          if (options?.onError) {
            options.onError(error);
          }
        }
      });
    }
  };

  return {
    ...requests,
    createRequest: enhancedCreateRequest,
    isRefreshing
  };
};
