
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePortfolioSync = () => {
  const { data: portfolios, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('🔄 Fetching portfolios from database...');
      
      try {
        const { data: dbPortfolios, error: dbError } = await supabase
          .from('portfolios')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) {
          console.error('❌ Database error:', dbError);
          throw dbError;
        }

        console.log('📊 Portfolios from database:', dbPortfolios);
        return dbPortfolios;
      } catch (error) {
        console.error('❌ Error fetching portfolios:', error);
        toast.error('حدث خطأ أثناء جلب البيانات');
        throw error;
      }
    },
    retry: 1,
    retryDelay: 1000
  });

  const handleSync = async () => {
    console.log('🔄 Starting manual data refresh...');
    toast.loading('جاري تحديث البيانات...');
    try {
      await refetch();
      toast.success('تم تحديث البيانات بنجاح');
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
