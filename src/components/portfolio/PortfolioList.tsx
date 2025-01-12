import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Folder, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AddPortfolioDialog } from './AddPortfolioDialog';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const PortfolioList = () => {
  const navigate = useNavigate();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_workspaces')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      return data;
    }
  });

  if (isLoading) {
    return <div className="p-4">جاري التحميل...</div>;
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

              <div className="flex justify-end">
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/portfolios/${portfolio.id}/projects/new`);
                  }}
                >
                  <Plus className="h-4 w-4" />
                  إضافة مشروع
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};