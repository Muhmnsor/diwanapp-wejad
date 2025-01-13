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
import { PortfolioBreadcrumb } from '@/components/portfolio/PortfolioBreadcrumb';

const PortfolioProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // Fetch project details
  const { data: project, isLoading, error } = useQuery({
    queryKey: ['portfolio-project', projectId],
    queryFn: async () => {
      console.log('Fetching portfolio project details for ID:', projectId);
      
      const { data: projectData, error: fetchError } = await supabase
        .from('portfolio_projects')
        .select(`
          *,
          project:projects(*),
          portfolio:portfolios(*)
        `)
        .eq('id', projectId)
        .single();

      if (fetchError) {
        console.error('Error fetching project:', fetchError);
        throw new Error(fetchError.message || 'حدث خطأ أثناء تحميل بيانات المشروع');
      }

      if (!projectData) {
        console.error('Project data not found for ID:', projectId);
        throw new Error('لم يتم العثور على المشروع');
      }

      console.log('Successfully fetched project data:', projectData);
      return projectData;
    },
    retry: 1,
    meta: {
      errorMessage: 'حدث خطأ أثناء تحميل بيانات المشروع'
    }
  });

  // Fetch tasks for the project
  const { data: tasks } = useQuery({
    queryKey: ['portfolio-project-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('workspace_id', projectId);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId
  });

  const getProjectProgress = () => {
    if (!tasks) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow bg-gray-50">
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

  if (error || !project) {
    toast.error('حدث خطأ أثناء تحميل بيانات المشروع');
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center" dir="rtl">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                لم يتم العثور على المشروع
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
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <PortfolioBreadcrumb 
            portfolioName={project.portfolio?.name || ''}
            portfolioId={project.portfolio?.id || ''}
            projectName={project.project?.title}
          />
          
          <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{project.project?.title}</h1>
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
                {project.project?.description || 'لا يوجد وصف'}
              </p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>تقدم المشروع</span>
                  <span>{getProjectProgress()}%</span>
                </div>
                <Progress value={getProjectProgress()} className="h-2" />
              </div>
            </Card>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">المهام</h2>
              {tasks?.length > 0 ? (
                <div className="grid gap-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-500">
                            {task.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          task.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {task.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">لا توجد مهام في هذا المشروع</p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PortfolioProjectDetails;