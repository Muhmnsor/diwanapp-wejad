
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

  const fetchAllRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("requests")
        .select(`
          *,
          request_type: request_types (*),
          workflow: request_workflows (*),
          requester: profiles (*),
          current_step: workflow_steps (*)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("Fetched requests:", data);
      setRequests(data || []);
      setFilteredRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching all requests:", error);
      setError(error.message || "حدث خطأ أثناء جلب بيانات الطلبات");
      toast.error("فشل في تحميل قائمة الطلبات");
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
  const refreshRequests = () => setRefreshTrigger(prev => prev + 1);

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
