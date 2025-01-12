import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PortfolioDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: portfolio, isLoading } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      console.log('Fetching portfolio details:', id);
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_projects (
            *,
            projects (*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching portfolio:', error);
        throw error;
      }

      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 space-y-4" dir="rtl">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!portfolio) {
    return <div className="p-4" dir="rtl">لم يتم العثور على المحفظة</div>;
  }

  return (
    <div className="container mx-auto p-4 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{portfolio.name}</h1>
        <Button 
          onClick={() => navigate(`/portfolios/${id}/projects/new`)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          إضافة مشروع
        </Button>
      </div>
      
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-2">الوصف</h2>
        <p className="text-gray-600">
          {portfolio.description || 'لا يوجد وصف'}
        </p>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">المشاريع</h2>
        {portfolio.portfolio_projects?.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.portfolio_projects.map((pp) => (
              <Card key={pp.id} className="p-4">
                <h3 className="font-medium">{pp.projects?.title}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {pp.projects?.description || 'لا يوجد وصف'}
                </p>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">لا توجد مشاريع في هذه المحفظة</p>
        )}
      </div>
    </div>
  );
};

export default PortfolioDetails;