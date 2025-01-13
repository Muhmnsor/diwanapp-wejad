import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePortfolioSync = () => {
  const { data: portfolios, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('🔄 Starting portfolio synchronization...');
      
      const { data: dbPortfolios, error: dbError } = await supabase
        .from('portfolios')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw dbError;
      }

      console.log('📊 Portfolios from database:', dbPortfolios);

      try {
        // Get workspace data from Asana
        console.log('🔍 Fetching Asana workspace data...');
        const response = await supabase.functions.invoke('get-workspace', {
          body: { workspaceId: process.env.VITE_ASANA_WORKSPACE_ID }
        });

        if (response.error) {
          console.error('❌ Asana sync failed:', response.error);
          toast.error('فشل في مزامنة البيانات مع Asana');
          return dbPortfolios;
        }

        console.log('✅ Asana sync successful:', response.data);
        toast.success('تم تحديث البيانات بنجاح');
        
        // Return the updated portfolios from the response
        return response.data.portfolios || dbPortfolios;
      } catch (asanaError) {
        console.error('❌ Error syncing with Asana:', asanaError);
        toast.error('حدث خطأ أثناء الاتصال مع Asana');
        return dbPortfolios;
      }
    }
  });

  const handleSync = async () => {
    toast.loading('جاري مزامنة البيانات مع Asana...');
    try {
      await refetch();
    } catch (error) {
      console.error('❌ Sync error:', error);
      toast.error('فشل في تحديث البيانات');
    }
  };

  return {
    portfolios,
    isLoading,
    error,
    handleSync
  };
};