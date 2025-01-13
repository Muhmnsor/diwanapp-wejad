import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Folder } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddPortfolioDialog } from './AddPortfolioDialog';
import { useNavigate } from 'react-router-dom';

export const PortfolioList = () => {
  const navigate = useNavigate();

  const { data: portfolios, isLoading, error } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      console.log('Starting portfolio fetch from database...');
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .not('asana_gid', 'is', null) // Only get portfolios with Asana IDs
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      console.log('Raw portfolios data from database:', data);
      console.log('Number of portfolios found:', data?.length);
      console.log('Portfolios with Asana GIDs:', data?.filter(p => p.asana_gid));
      
      return data;
    }
  });

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
        <AddPortfolioDialog />
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