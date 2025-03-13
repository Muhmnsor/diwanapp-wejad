
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
      // Try using our new security definer function to avoid RLS issues
      const { data, error: fetchError } = await supabase
        .rpc('get_all_requests_admin');

      if (fetchError) {
        // Fall back to direct query if RPC fails
        console.warn("Falling back to direct query due to RPC error:", fetchError);
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
          
        if (directError) throw directError;
        
        console.log("Fetched requests via direct query:", directData);
        setRequests(directData || []);
        setFilteredRequests(directData || []);
      } else {
        console.log("Fetched requests via RPC:", data);
        
        // We need to fetch the relations separately since RPC can't do joins
        const enrichedData = await Promise.all((data || []).map(async (request) => {
          // Fetch related data
          const [requestTypeRes, workflowRes, requesterRes, stepRes] = await Promise.all([
            // Get request type
            request.request_type_id ? supabase.from('request_types').select('*').eq('id', request.request_type_id).single() : null,
            // Get workflow
            request.workflow_id ? supabase.from('request_workflows').select('*').eq('id', request.workflow_id).single() : null,
            // Get requester
            request.requester_id ? supabase.from('profiles').select('*').eq('id', request.requester_id).single() : null,
            // Get current step
            request.current_step_id ? supabase.from('workflow_steps').select('*').eq('id', request.current_step_id).single() : null
          ]);
          
          return {
            ...request,
            request_type: requestTypeRes?.data || null,
            workflow: workflowRes?.data || null,
            requester: requesterRes?.data || null,
            current_step: stepRes?.data || null
          };
        }));
        
        setRequests(enrichedData || []);
        setFilteredRequests(enrichedData || []);
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
