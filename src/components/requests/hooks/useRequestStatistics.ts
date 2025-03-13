
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequestStatistics } from "@/components/users/types";
import { toast } from "sonner";

// Define specific type for the request types response
interface RequestTypeResponse {
  request_type_id: string;
  request_types: {
    id: string;
    name: string;
  } | null;
}

export const useRequestStatistics = () => {
  const [statistics, setStatistics] = useState<RequestStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching request statistics...");
      
      // Try to get statistics via RPC function first (more efficient)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_request_statistics');
      
      if (rpcError) {
        console.error("Error with RPC function:", rpcError);
        // Fall back to individual queries if RPC fails
        await fetchStatisticsWithIndividualQueries();
      } else if (rpcData) {
        console.log("Fetched statistics via RPC:", rpcData);
        setStatistics(rpcData as RequestStatistics);
      } else {
        throw new Error("No data returned from statistics query");
      }
    } catch (err: any) {
      console.error("Error fetching request statistics:", err);
      // Try the fallback method
      await fetchStatisticsWithIndividualQueries();
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatisticsWithIndividualQueries = async () => {
    try {
      // Get total requests count
      const { count: totalRequests, error: totalError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });
      
      if (totalError) throw totalError;
      
      // Get pending requests count
      const { count: pendingRequests, error: pendingError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      if (pendingError) throw pendingError;
      
      // Get completed requests count
      const { count: completedRequests, error: completedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      if (completedError) throw completedError;
      
      // Get rejected requests count
      const { count: rejectedRequests, error: rejectedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
      
      if (rejectedError) throw rejectedError;
      
      // Get in progress count (not pending, not completed, not rejected)
      const { count: inProgressRequests, error: inProgressError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .not('status', 'in', '(pending,completed,rejected)');
      
      if (inProgressError) throw inProgressError;
      
      // Get requests by type
      const { data: requestsByTypeData, error: typeError } = await supabase
        .from('requests')
        .select(`
          request_type_id,
          request_types (
            id,
            name
          )
        `);
      
      if (typeError) throw typeError;
      
      // Process request by type data
      const typeCount: Record<string, { typeId: string, typeName: string, count: number }> = {};
      
      if (requestsByTypeData) {
        requestsByTypeData.forEach((request: RequestTypeResponse) => {
          const typeId = request.request_type_id;
          
          // This is the corrected part to access the nested request_types object
          // Since request_types is returned as an object not as an array
          const typeName = request.request_types?.name || 'غير محدد';
          
          if (!typeCount[typeId]) {
            typeCount[typeId] = { typeId, typeName, count: 0 };
          }
          
          typeCount[typeId].count++;
        });
      }
      
      // Get requests by status for chart
      const { data: statusData, error: statusError } = await supabase
        .from('requests')
        .select('status');
      
      if (statusError) throw statusError;
      
      const statusCounts: Record<string, number> = {
        'pending': 0,
        'completed': 0,
        'rejected': 0,
        'in_progress': 0
      };
      
      if (statusData) {
        statusData.forEach(request => {
          const status = request.status || 'غير محدد';
          if (status === 'pending') {
            statusCounts['pending']++;
          } else if (status === 'completed') {
            statusCounts['completed']++;
          } else if (status === 'rejected') {
            statusCounts['rejected']++;
          } else {
            statusCounts['in_progress']++;
          }
        });
      }
      
      // Format statistics
      const statsData: RequestStatistics = {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        approvedRequests: completedRequests || 0,
        rejectedRequests: rejectedRequests || 0,
        inProgressRequests: inProgressRequests || 0,
        requestsByType: Object.values(typeCount),
        requestsByStatus: Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }))
      };
      
      console.log("Fetched statistics with individual queries:", statsData);
      setStatistics(statsData);
    } catch (err: any) {
      console.error("Error in fallback statistics method:", err);
      setError(err.message || "حدث خطأ أثناء جلب إحصائيات الطلبات");
      toast.error("فشل في تحميل إحصائيات الطلبات");
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    isLoading,
    error,
    refreshStatistics: fetchStatistics
  };
};
