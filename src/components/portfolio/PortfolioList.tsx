import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Folder, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddPortfolioDialog } from './AddPortfolioDialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const PortfolioList = () => {
  const navigate = useNavigate();

  const { data: portfolios, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Starting portfolio fetch from database...');
      
      // First get portfolios from database
      const { data: dbPortfolios, error: dbError } = await supabase
        .from('portfolios')
        .select('*')
        .not('asana_gid', 'is', null)
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }

      console.log('Raw portfolios data from database:', dbPortfolios);
      console.log('Number of portfolios found:', dbPortfolios?.length);
      console.log('Portfolios with Asana GIDs:', dbPortfolios?.filter(p => p.asana_gid));

      // Now try to sync with Asana
      try {
        const response = await fetch('/functions/v1/get-workspace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });

        if (!response.ok) {
          console.error('Asana sync failed:', await response.text());
          toast.error('فشل في مزامنة البيانات مع Asana');
          return dbPortfolios;
        }

        const asanaData = await response.json();
        console.log('Asana workspace data:', asanaData);
        
        return dbPortfolios;
      } catch (asanaError) {
        console.error('Error syncing with Asana:', asanaError);
        toast.error('حدث خطأ أثناء الاتصال مع Asana');
        return dbPortfolios;
      }
    }
  });

  const handleSync = async () => {
    toast.loading('جاري مزامنة البيانات مع Asana...');
    try {
      await refetch();
      toast.success('تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('فشل في تحديث البيانات');
    }
  };

  if (error) {
    console.error('Query error:', error);
    return <div className="p-4 text-red-500">حدث خطأ أثناء تحميل المحافظ</div>;
  }

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (!portfolios?.length) {
    return <div className="p-4">لم يتم العثور على محافظ</div>;
  }

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">المحافظ</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleSync}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            مزامنة مع Asana
          </Button>
          <AddPortfolioDialog />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {portfolios?.map((portfolio) => (
          <Card 
            key={portfolio.id} 
            className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/portfolios/${portfolio.id}`)}
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2">
                <Folder className="h-5 w-5 text-primary" />
                <span className="font-medium">{portfolio.name}</span>
              </div>
              
              <div className="text-sm text-gray-500 min-h-[2.5rem]">
                {portfolio.description || 'لا يوجد وصف'}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};