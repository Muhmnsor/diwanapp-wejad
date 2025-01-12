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

const PortfolioProjectDetails = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const { data: tasks } = useQuery({
    queryKey: ['portfolio-workspace-tasks', workspaceId],
    queryFn: async () => {
      console.log('Fetching tasks for workspace:', workspaceId);
      
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('workspace_id', workspaceId);
      
      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
      
      console.log('Successfully fetched tasks:', data);
      return data || [];
    },
    enabled: !!workspaceId
  });

  const getProjectProgress = () => {
    if (!tasks) return 0;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6" dir="rtl">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">تفاصيل المشروع</h1>
              <Button 
                onClick={() => {}} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة مهمة
              </Button>
            </div>

            <Card className="p-4">
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