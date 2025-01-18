import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { PortfolioTasks } from '@/components/portfolio/PortfolioTasks';
import { WorkspaceHeader } from '@/components/portfolio/workspace/WorkspaceHeader';
import { WorkspaceProgress } from '@/components/portfolio/workspace/WorkspaceProgress';

const PortfolioWorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  // Fetch workspace details
  const { data: workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useQuery({
    queryKey: ['portfolio-workspace', workspaceId],
    queryFn: async () => {
      console.log('Fetching workspace details for ID:', workspaceId);
      
      const { data: workspaceData, error: fetchError } = await supabase
        .functions.invoke('get-workspace', {
          body: { workspaceId }
        });

      if (fetchError) {
        console.error('Error fetching workspace:', fetchError);
        throw new Error(fetchError.message || 'حدث خطأ أثناء تحميل بيانات مساحة العمل');
      }

      console.log('Successfully fetched workspace data:', workspaceData);
      return workspaceData;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات مساحة العمل'
    }
  });

  // Fetch portfolio details
  const { data: portfolio, isLoading: isPortfolioLoading } = useQuery({
    queryKey: ['portfolio-details', workspace?.portfolio_id],
    queryFn: async () => {
      console.log('Fetching portfolio details for ID:', workspace?.portfolio_id);
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', workspace?.portfolio_id)
        .single();

      if (error) {
        console.error('Error fetching portfolio:', error);
        throw error;
      }

      console.log('Successfully fetched portfolio data:', data);
      return data;
    },
    enabled: !!workspace?.portfolio_id
  });

  if (isWorkspaceLoading || isPortfolioLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="p-4 space-y-4" dir="rtl">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (workspaceError || !workspace) {
    toast.error('حدث خطأ أثناء تحميل بيانات مساحة العمل');
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center" dir="rtl">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                لم يتم العثور على مساحة العمل
              </h2>
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
              >
                العودة
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6" dir="rtl">
            <WorkspaceHeader 
              portfolioName={portfolio?.name || 'المحفظة'}
              portfolioId={portfolio?.id || ''}
              workspaceName={workspace.name}
            />
            
            <WorkspaceProgress tasks={workspace.tasks} />

            <PortfolioTasks workspaceId={workspaceId!} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioWorkspaceDetails;