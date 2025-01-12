import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

const PortfolioProjectDetails = () => {
  const { id } = useParams();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['portfolio-project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_projects')
        .select(`
          *,
          project:projects(*)
        `)
        .eq('asana_gid', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Fetch tasks for this project
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('workspace_id', id);
      
      if (error) throw error;
      return data || [];
    },
  });

  const getProjectProgress = () => {
    if (!tasks) return 0;
    if (tasks.length === 0) return 0;
    
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  if (projectLoading || tasksLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!project) {
    return <div>لم يتم العثور على المشروع</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6" dir="rtl">
            {/* Project Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">{project.project?.title}</h1>
                <p className="text-gray-600 mt-2">{project.project?.description}</p>
              </div>
              <Button 
                onClick={() => setIsAddTaskDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                إضافة مهمة
              </Button>
            </div>

            {/* Progress Section */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">تقدم المشروع</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>نسبة الإنجاز</span>
                  <span>{getProjectProgress()}%</span>
                </div>
                <Progress value={getProjectProgress()} className="h-2" />
              </div>
            </Card>

            {/* Tasks Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">المهام</h2>
              {tasks && tasks.length > 0 ? (
                <div className="grid gap-4">
                  {tasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {task.description || 'لا يوجد وصف'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.status === 'completed' ? 'مكتمل' :
                           task.status === 'in_progress' ? 'قيد التنفيذ' :
                           'جديد'}
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

      {/* TODO: Implement AddTaskDialog component */}
    </div>
  );
};

export default PortfolioProjectDetails;