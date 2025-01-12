import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAsanaSync = (departmentId: string) => {
  const queryClient = useQueryClient();

  // Fetch sync status
  const { data: syncStatus, isLoading } = useQuery({
    queryKey: ['sync-status', departmentId],
    queryFn: async () => {
      console.log('Fetching sync status for department:', departmentId);
      
      const { data, error } = await supabase
        .from('sync_status')
        .select('*')
        .eq('department_id', departmentId)
        .single();

      if (error) {
        console.error('Error fetching sync status:', error);
        throw error;
      }

      return data;
    }
  });

  // Update sync settings
  const { mutate: updateSyncSettings } = useMutation({
    mutationFn: async (settings: {
      sync_enabled: boolean;
      sync_interval: number;
      sync_comments: boolean;
      sync_attachments: boolean;
    }) => {
      console.log('Updating sync settings:', settings);

      const { error } = await supabase
        .from('sync_status')
        .upsert({
          department_id: departmentId,
          ...settings
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sync-status', departmentId] });
      toast.success('تم تحديث إعدادات المزامنة بنجاح');
    },
    onError: (error) => {
      console.error('Error updating sync settings:', error);
      toast.error('حدث خطأ أثناء تحديث إعدادات المزامنة');
    }
  });

  // Trigger manual sync
  const { mutate: triggerSync, isPending: isSyncing } = useMutation({
    mutationFn: async () => {
      console.log('Triggering manual sync for department:', departmentId);
      
      const { error } = await supabase.functions.invoke('asana-sync', {
        body: { departmentId, action: 'sync' }
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('تمت المزامنة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['sync-status', departmentId] });
    },
    onError: (error) => {
      console.error('Error during sync:', error);
      toast.error('حدث خطأ أثناء المزامنة');
    }
  });

  return {
    syncStatus,
    isLoading,
    isSyncing,
    updateSyncSettings,
    triggerSync
  };
};