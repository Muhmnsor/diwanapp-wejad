
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Request = {
  id: string;
  title: string;
  form_data: any;
  status: string;
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
      
      // Use the new RPC function that includes all relations
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_all_requests_with_relations');
        
      if (rpcError) {
        console.error("Error with RPC function:", rpcError);
        throw rpcError;
      }
      
      if (rpcData) {
        console.log("Fetched requests via RPC:", rpcData.length || 0, "requests");
        setRequests(rpcData);
        setFilteredRequests(rpcData);
      } else {
        // Fallback to direct query if RPC returns no data
        console.log("RPC returned no data, trying direct query...");
        
        const { data: directData, error: directError } = await supabase
          .from("requests")
          .select(`
            *,
            request_type: request_types (*),
            workflow: request_workflows (*),
            requester: profiles (*),
            current_step: workflow_steps (*)
          `)
          .order("created_at", { ascending: false });
          
        if (directError) {
          console.error("Error with direct query:", directError);
          throw directError;
        }
        
        console.log("Fetched requests via direct query:", directData?.length || 0, "requests");
        
        if (directData) {
          // Map the data to ensure proper structure
          const formattedData = directData.map(request => ({
            ...request,
            request_type: request.request_type?.[0] || null,
            workflow: request.workflow?.[0] || null,
            requester: request.requester?.[0] || null,
            current_step: request.current_step?.[0] || null
          }));
          
          setRequests(formattedData);
          setFilteredRequests(formattedData);
        } else {
          // Set empty arrays if no data returned
          setRequests([]);
          setFilteredRequests([]);
        }
      }
    } catch (error: any) {
      console.error("Error fetching all requests:", error);
      setError(error.message || "حدث خطأ أثناء جلب بيانات الطلبات");
      
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
