import { useParams, useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { TopHeader } from '@/components/layout/TopHeader';
import { Footer } from '@/components/layout/Footer';
import { AddTaskDialog } from '@/components/portfolio/tasks/AddTaskDialog';
import { useState } from 'react';
import { ProjectHeader } from '@/components/portfolio/workspace/ProjectHeader';
import { ProjectDetails } from '@/components/portfolio/workspace/ProjectDetails';
import { TasksList } from '@/components/portfolio/workspace/TasksList';
import { useProjectWorkspace } from '@/hooks/workspace/useProjectWorkspace';

const PortfolioWorkspaceDetails = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);

  const { data: workspace, isLoading, error, refetch } = useProjectWorkspace(workspaceId!);

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

  if (error || !workspace) {
    toast.error('حدث خطأ أثناء تحميل بيانات مساحة العمل');
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center" dir="rtl">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                لم يتم العثور على مساحة العمل
              </h2>
              <button 
                className="text-primary hover:underline"
                onClick={() => navigate(-1)}
              >
                العودة
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const taskProgress = workspace.tasks ? 
    Math.round((workspace.tasks.filter(task => task.status === 'completed').length / workspace.tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6" dir="rtl">
            <ProjectHeader 
              title={workspace.name} 
              onAddTask={() => setIsAddTaskDialogOpen(true)} 
            />

            <ProjectDetails 
              description={workspace.description} 
              taskProgress={taskProgress}
            />

            <TasksList tasks={workspace.tasks || []} />
          </div>
        </div>
      </main>
      <Footer />

      <AddTaskDialog
        open={isAddTaskDialogOpen}
        onOpenChange={setIsAddTaskDialogOpen}
        workspaceId={workspaceId!}
        onSuccess={refetch}
      />
    </div>
  );
};

export default PortfolioWorkspaceDetails;