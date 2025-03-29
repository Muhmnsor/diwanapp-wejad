
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RequestStatus } from "@/types/meeting";

export type Request = {
  id: string;
  title: string;
  form_data: any;
  status: RequestStatus;
  priority: string;
  requester_id: string;
  request_type_id: string;
  workflow_id: string;
  current_step_id: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  request_type?: {
    id: string;
    name: string;
    description: string | null;
  };
  workflow?: {
    id: string;
    name: string;
    description: string | null;
  };
  requester?: {
    id: string;
    display_name: string | null;
    email: string | null;
  };
  current_step?: {
    id: string;
    step_name: string;
    step_type: string;
  };
};

export const useAllRequests = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching all requests...");
      
      // Use the RPC function that includes all relations
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_requests_with_relations');
        
      if (rpcError) {
        console.error("Error with RPC function:", rpcError);
        throw rpcError;
      }
      
      if (rpcData && Array.isArray(rpcData)) {
        console.log("Fetched requests via RPC:", rpcData.length || 0, "requests");
        
        // Transform the data to ensure it matches our Request type
        const transformedData: Request[] = rpcData.map(item => {
          try {
            // Parse the JSON if it's a string
            const requestData = typeof item === 'string' ? JSON.parse(item) : item;
            
            // Ensure all required fields exist with proper defaults
            return {
              id: requestData.id || '',
              title: requestData.title || '',
              form_data: requestData.form_data || {},
              status: requestData.status || 'pending',
              priority: requestData.priority || 'medium',
              requester_id: requestData.requester_id || '',
              request_type_id: requestData.request_type_id || '',
              workflow_id: requestData.workflow_id || '',
              current_step_id: requestData.current_step_id || null,
              due_date: requestData.due_date || null,
              created_at: requestData.created_at || new Date().toISOString(),
              updated_at: requestData.updated_at || new Date().toISOString(),
              // Ensure nested objects are properly structured
              request_type: requestData.request_type || null,
              workflow: requestData.workflow || null,
              requester: requestData.requester || null,
              current_step: requestData.current_step || null
            };
          } catch (parseError) {
            console.error("Error parsing request data:", parseError, item);
            // Return a minimal valid object in case of parsing error
            return {
              id: '',
              title: 'Error parsing data',
              form_data: {},
              status: 'error',
              priority: 'medium',
              requester_id: '',
              request_type_id: '',
              workflow_id: '',
              current_step_id: null,
              due_date: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
          }
        }).filter(req => req.id !== ''); // Filter out any invalid records
        
        console.log("Transformed data:", transformedData);
        setRequests(transformedData);
        setFilteredRequests(transformedData);
      } else {
        // Handle case when no data returned or is not in expected format
        console.warn("RPC returned no data or data is not in expected format");
        
        // No need for fallback query - simply set empty arrays if no data
        // This prevents unnecessary queries and is more efficient
        setRequests([]);
        setFilteredRequests([]);
        
        // Show appropriate message to user via toast notification
        toast.warning("لم يتم العثور على أي طلبات أو ليس لديك صلاحية لرؤيتها");
      }
    } catch (error: any) {
      console.error("Error fetching all requests:", error);
      
      // Set a user-friendly error message
      const errorMessage = error.message?.includes('permission denied') 
        ? "ليس لديك صلاحية للوصول إلى قائمة الطلبات"
        : "حدث خطأ أثناء جلب بيانات الطلبات";
      
      setError(errorMessage);
      
      // Only show toast on first attempt to avoid spam
      if (retryCount === 0) {
        toast.error("فشل في تحميل قائمة الطلبات");
      }
      
      // If we've tried less than 3 times, attempt again
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => setRefreshTrigger(prev => prev + 1), 2000); // Retry after 2 seconds
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to requests
  const applyFilters = () => {
    let result = [...requests];
    
    // Apply status filter if selected
    if (statusFilter) {
      result = result.filter(request => request.status === statusFilter);
    }
    
    setFilteredRequests(result);
  };

  // Set status filter and apply filters
  const filterByStatus = (status: string | null) => {
    setStatusFilter(status);
  };

  // Watch for filter changes
  useEffect(() => {
    applyFilters();
  }, [requests, statusFilter]);

  // Refresh function
  const refreshRequests = () => {
    setRetryCount(0); // Reset retry count on manual refresh
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    fetchAllRequests();
  }, [refreshTrigger]);

  return {
    requests: filteredRequests,
    allRequests: requests,
    isLoading,
    error,
    refreshRequests,
    filterByStatus,
    statusFilter
  };
};
