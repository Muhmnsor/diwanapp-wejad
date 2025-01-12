import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { Progress } from '@/components/ui/progress';

const PortfolioWorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const { data: workspace, isLoading: isWorkspaceLoading, error: workspaceError } = useQuery({
    queryKey: ['portfolio-workspace', workspaceId],
    queryFn: async () => {
      console.log('Fetching workspace details for ID:', workspaceId);
      
      const { data: workspaceData, error: fetchError } = await supabase
        .from('portfolio_workspaces')
        .select('*')
        .eq('asana_gid', workspaceId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching workspace:', fetchError);
        throw new Error('خطأ في جلب بيانات مساحة العمل');
      }

      if (!workspaceData) {
        console.error('Workspace not found for ID:', workspaceId);
        throw new Error('لم يتم العثور على مساحة العمل');
      }

      console.log('Successfully fetched workspace data:', workspaceData);
      return workspaceData;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات مساحة العمل'
    }
  });

  // Only fetch tasks if we have a valid workspace
  const { data: tasks = [] } = useQuery({
    queryKey: ['portfolio-workspace-tasks', workspace?.id],
    queryFn: async () => {
      console.log('Fetching tasks for workspace:', workspace?.id);
      
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('workspace_id', workspace?.id);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Successfully fetched tasks:', data);
      return data || [];
    },
    enabled: !!workspace?.id // Only run query if we have the workspace UUID
  });

  const getTasksProgress = () => {
    if (!tasks?.length) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (workspaceError) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="p-4 text-center" dir="rtl">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                لم يتم العثور على مساحة العمل
              </h2>
              <p className="text-gray-600 mb-4">
                عذراً، لا يمكن العثور على مساحة العمل المطلوبة
              </p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/portfolios')}
              >
                العودة إلى المحافظ
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isWorkspaceLoading || !workspace) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-4" dir="rtl">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-24 w-full" />
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
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{workspace.name}</h1>
              <Button 
                onClick={() => {}} // Will implement task creation dialog later
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة مهمة
              </Button>
            </div>
            
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-2">الوصف</h2>
              <p className="text-gray-600 mb-4">
                {workspace.description || 'لا يوجد وصف'}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تقدم المهام</span>
                  <span>{getTasksProgress()}%</span>
                </div>
                <Progress value={getTasksProgress()} className="h-2" />
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">المهام</h2>
              {tasks.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <h3 className="font-medium mb-2">{task.title}</h3>
                      <p className="text-sm text-gray-500">
                        {task.description || 'لا يوجد وصف'}
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">لا توجد مهام في مساحة العمل هذه</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioWorkspaceDetails;