import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

const ProjectTasks = () => {
  const { projectId } = useParams();
  const [isAddingTask, setIsAddingTask] = useState(false);

  const { data: tasks, isLoading, refetch } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      console.log('Fetching project tasks for:', projectId);
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          *,
          assigned_to:profiles(email)
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      return data;
    }
  });

  const handleAddTask = async (taskData: any) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .insert([{ ...taskData, project_id: projectId }]);

      if (error) throw error;
      toast.success('تم إضافة المهمة بنجاح');
      refetch();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('حدث خطأ أثناء إضافة المهمة');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('project_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      toast.success('تم حذف المهمة بنجاح');
      refetch();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة');
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مهام المشروع</h1>
          <Button onClick={() => setIsAddingTask(true)}>
            <Plus className="h-4 w-4 ml-2" />
            مهمة جديدة
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مهام لهذا المشروع
          </div>
        ) : (
          <div className="grid gap-4">
            {tasks?.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    {task.description && (
                      <p className="text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="text-sm text-muted-foreground mt-2">
                      {task.assigned_to?.email && (
                        <span>مسند إلى: {task.assigned_to.email}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => {}}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProjectTasks;