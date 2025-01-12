import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { CreatePortfolioProjectDialog } from '@/components/projects/portfolio/CreatePortfolioProjectDialog';
import { useState } from 'react';

const PortfolioDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: portfolio, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio', id],
    queryFn: async () => {
      console.log('Fetching portfolio details for ID:', id);
      
      const { data: portfolioData, error: fetchError } = await supabase
        .functions.invoke('get-portfolio', {
          body: { portfolioId: id }
        });

      if (fetchError) {
        console.error('Error fetching portfolio:', fetchError);
        throw new Error(fetchError.message || 'حدث خطأ أثناء تحميل بيانات المحفظة');
      }

      if (!portfolioData) {
        console.error('Portfolio data not found for ID:', id);
        throw new Error('لم يتم العثور على المحفظة');
      }

      console.log('Successfully fetched portfolio data:', portfolioData);
      return portfolioData;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات المحفظة'
    }
  });

  // Show error toast when query fails
  if (error) {
    toast.error('حدث خطأ أثناء تحميل بيانات المحفظة');
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-4 space-y-4" dir="rtl">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (error || !portfolio) {
      return (
        <div className="p-4 text-center" dir="rtl">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">لم يتم العثور على المحفظة</h2>
          <p className="text-gray-600 mb-4">عذراً، لا يمكن العثور على المحفظة المطلوبة</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/portfolios')}
          >
            العودة إلى المحافظ
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6" dir="rtl">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{portfolio.name}</h1>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
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
          {portfolio.items?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.items.map((item: any) => (
                <Card key={item.gid} className="p-4">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500 mt-2">
                    {item.notes || 'لا يوجد وصف'}
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

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {renderContent()}
        </div>
      </main>
      <Footer />

      <CreatePortfolioProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        portfolioId={id!}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PortfolioDetails;