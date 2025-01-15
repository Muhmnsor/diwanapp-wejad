import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { CreatePortfolioProjectDialog } from '@/components/projects/portfolio/CreatePortfolioProjectDialog';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { PortfolioBreadcrumb } from '@/components/portfolio/PortfolioBreadcrumb';

const PortfolioDetails = () => {
  const { id: portfolioId } = useParams();
  const navigate = useNavigate();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: portfolio, isLoading, error, refetch } = useQuery({
    queryKey: ['portfolio-workspace', portfolioId],
    queryFn: async () => {
      console.log('Fetching portfolio workspace details for ID:', portfolioId);
      
      const { data: portfolioData, error: fetchError } = await supabase
        .functions.invoke('get-portfolio', {
          body: { portfolioId }
        });

      if (fetchError) {
        console.error('Error fetching portfolio workspace:', fetchError);
        throw new Error(fetchError.message || 'حدث خطأ أثناء تحميل بيانات المحفظة');
      }

      if (!portfolioData) {
        console.error('Portfolio workspace data not found for ID:', portfolioId);
        throw new Error('لم يتم العثور على المحفظة');
      }

      console.log('Successfully fetched portfolio workspace data:', portfolioData);
      return portfolioData;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات المحفظة'
    }
  });

  // Fetch portfolio tasks
  const { data: portfolioTasks } = useQuery({
    queryKey: ['portfolio-workspace-tasks', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('workspace_id', portfolioId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolioId
  });

  const getPortfolioTaskProgress = (workspaceId: string) => {
    if (!portfolioTasks) return 0;
    const workspaceTasks = portfolioTasks.filter(task => task.workspace_id === workspaceId);
    if (workspaceTasks.length === 0) return 0;
    
    const completedTasks = workspaceTasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / workspaceTasks.length) * 100);
  };

  const getPortfolioStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const handlePortfolioWorkspaceClick = (workspaceId: string) => {
    console.log('Navigating to workspace details:', workspaceId);
    navigate(`/portfolio-workspaces/${workspaceId}`);
  };

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
            onClick={() => navigate('/tasks')}
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

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">المشاريع</h2>
          {portfolio.items?.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {portfolio.items.map((item: any) => (
                <Card 
                  key={item.gid} 
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePortfolioWorkspaceClick(item.gid)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">{item.name}</h3>
                    {getPortfolioStatusIcon(item.status || 'not_started')}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    {item.notes || 'لا يوجد وصف'}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>تقدم المشروع</span>
                      <span>{getPortfolioTaskProgress(item.gid)}%</span>
                    </div>
                    <Progress value={getPortfolioTaskProgress(item.gid)} className="h-2" />
                  </div>
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
          {portfolio && (
            <PortfolioBreadcrumb 
              portfolioName={portfolio.name}
              portfolioId={portfolioId!}
            />
          )}
          {renderContent()}
        </div>
      </main>
      <Footer />

      <CreatePortfolioProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        portfolioId={portfolioId!}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PortfolioDetails;