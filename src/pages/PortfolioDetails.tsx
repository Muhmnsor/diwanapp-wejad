import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { CreatePortfolioProjectDialog } from '@/components/projects/portfolio/CreatePortfolioProjectDialog';
import { useState } from 'react';
import { PortfolioWorkspaceHeader } from '@/components/portfolio/workspace/PortfolioWorkspaceHeader';
import { PortfolioWorkspaceDescription } from '@/components/portfolio/workspace/PortfolioWorkspaceDescription';
import { PortfolioWorkspaceGrid } from '@/components/portfolio/workspace/PortfolioWorkspaceGrid';

const PortfolioDetails = () => {
  const { portfolioId } = useParams();
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

  const handlePortfolioWorkspaceClick = (workspaceId: string) => {
    console.log('Navigating to portfolio workspace details:', workspaceId);
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
        </div>
      );
    }

    return (
      <div className="space-y-6" dir="rtl">
        <PortfolioWorkspaceHeader 
          name={portfolio.name}
          onCreateProject={() => setIsCreateDialogOpen(true)}
        />
        
        <PortfolioWorkspaceDescription description={portfolio.description} />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">المشاريع</h2>
          <PortfolioWorkspaceGrid
            items={portfolio.items || []}
            getProgress={getPortfolioTaskProgress}
            onWorkspaceClick={handlePortfolioWorkspaceClick}
          />
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
        portfolioId={portfolioId!}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PortfolioDetails;