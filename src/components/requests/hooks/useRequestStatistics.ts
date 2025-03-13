
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface RequestStatistics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  requestsByType: {
    typeId: string;
    typeName: string;
    count: number;
  }[];
  requestsByStatus: {
    status: string;
    count: number;
  }[];
}

export const useRequestStatistics = () => {
  const [statistics, setStatistics] = useState<RequestStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    setIsLoading(true);
    setError(null);
    
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
      
      // Get approved requests count
      const { count: approvedRequests, error: approvedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed');
      
      if (approvedError) throw approvedError;
      
      // Get rejected requests count
      const { count: rejectedRequests, error: rejectedError } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected');
      
      if (rejectedError) throw rejectedError;
      
      // Get requests by type
      const { data: requestsByType, error: typeError } = await supabase
        .from('requests')
        .select(`
          request_type_id,
          request_types (
            name
          )
        `)
        .order('request_type_id');
      
      if (typeError) throw typeError;
      
      // Process request by type data
      const typeCount: Record<string, { id: string, name: string, count: number }> = {};
      requestsByType?.forEach(request => {
        const typeId = request.request_type_id;
        const typeName = request.request_types?.name || 'غير محدد';
        
        if (!typeCount[typeId]) {
          typeCount[typeId] = { id: typeId, name: typeName, count: 0 };
        }
        
        typeCount[typeId].count++;
      });
      
      // Get requests by status for chart
      const { data: statusData, error: statusError } = await supabase
        .from('requests')
        .select('status')
        .order('status');
      
      if (statusError) throw statusError;
      
      const statusCounts: Record<string, number> = {};
      statusData?.forEach(request => {
        const status = request.status || 'غير محدد';
        if (!statusCounts[status]) {
          statusCounts[status] = 0;
        }
        statusCounts[status]++;
      });
      
      // Format statistics
      const statsData: RequestStatistics = {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        approvedRequests: approvedRequests || 0,
        rejectedRequests: rejectedRequests || 0,
        requestsByType: Object.values(typeCount).map(item => ({
          typeId: item.id,
          typeName: item.name,
          count: item.count
        })),
        requestsByStatus: Object.entries(statusCounts).map(([status, count]) => ({
          status,
          count
        }))
      };
      
      setStatistics(statsData);
    } catch (err: any) {
      console.error("Error fetching request statistics:", err);
      setError(err.message || "حدث خطأ أثناء جلب إحصائيات الطلبات");
      toast.error("فشل في تحميل إحصائيات الطلبات");
    } finally {
      setIsLoading(false);
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
