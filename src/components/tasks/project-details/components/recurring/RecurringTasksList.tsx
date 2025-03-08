
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTaskCard } from "./RecurringTaskCard";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProjectMember } from "../../types/projectMember";
import { RecurringTask } from "../../types/recurringTask";

interface RecurringTasksListProps {
  projectId: string;
  projectMembers: ProjectMember[];
}

export const RecurringTasksList = ({ projectId, projectMembers }: RecurringTasksListProps) => {
  const [tasks, setTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<RecurringTask | null>(null);
  
  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTasks(data as RecurringTask[]);
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      toast.error('حدث خطأ أثناء تحميل المهام المتكررة');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchRecurringTasks();
    }
  }, [projectId]);
  
  const handleEditTask = (task: RecurringTask) => {
    setTaskToEdit(task);
    setIsDialogOpen(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('تم حذف المهمة المتكررة بنجاح');
    } catch (error) {
      console.error('Error deleting recurring task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة المتكررة');
    }
  };
  
  const handleCreateTaskInstance = async (taskId: string) => {
    try {
      // Call the server function to create a task instance
      const { data, error } = await supabase.functions.invoke('create-task-from-recurring', {
        body: { recurring_task_id: taskId }
      });
      
      if (error) throw error;
      
      toast.success('تم إنشاء مهمة جديدة من القالب المتكرر');
      return data;
    } catch (error) {
      console.error('Error creating task instance:', error);
      toast.error('حدث خطأ أثناء إنشاء المهمة');
      throw error;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">المهام المتكررة</h3>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          إضافة مهمة متكررة
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 bg-muted/20 rounded-md">
          لا توجد مهام متكررة. أضف مهمة متكررة لتظهر هنا.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map(task => (
            <RecurringTaskCard
              key={task.id}
              task={task}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onCreateInstance={handleCreateTaskInstance}
            />
          ))}
        </div>
      )}
      
      <RecurringTaskDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectId={projectId}
        projectMembers={projectMembers}
        onTaskCreated={fetchRecurringTasks}
      />
    </div>
  );
};
