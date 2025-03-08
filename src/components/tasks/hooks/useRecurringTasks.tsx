
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTask } from "../types/RecurringTask";
import { useAuthStore } from "@/store/authStore";

export const useRecurringTasks = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRecurringTasks();
  }, [user]);

  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }

      console.log("Checking admin status for user:", user.id);
      const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', { user_id: user.id });
      
      if (isAdminError) {
        console.error("Error checking admin status:", isAdminError);
        toast.error("حدث خطأ أثناء التحقق من صلاحيات المستخدم");
        throw isAdminError;
      }
      
      setIsAdmin(isAdminData || false);
      console.log("Is admin:", isAdminData);

      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          title,
          description,
          recurrence_type,
          interval,
          day_of_month,
          day_of_week,
          priority,
          category,
          project_id,
          workspace_id,
          created_by,
          created_at,
          is_active,
          assign_to,
          last_generated_date,
          next_generation_date,
          requires_deliverable,
          projects:project_id (
            title
          ),
          workspaces:workspace_id (
            name
          ),
          profiles:assign_to (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching recurring tasks:", error);
        toast.error("حدث خطأ أثناء تحميل المهام المتكررة");
        throw error;
      }

      console.log("Recurring tasks raw data:", data);
      
      // Process data
      const formattedTasks: RecurringTask[] = data.map(task => {
        // Some explicit type handling to avoid TypeScript errors
        const formattedTask: RecurringTask = {
          ...task,
          projects: task.projects as { title: string } | null,
          workspaces: task.workspaces as { name: string } | null,
          profiles: task.profiles as { display_name: string } | null,
          project_name: task.projects ? (task.projects as { title: string }).title : null,
          workspace_name: task.workspaces ? (task.workspaces as { name: string }).name : null,
          assignee_name: task.profiles ? (task.profiles as { display_name: string }).display_name : null,
        };
        return formattedTask;
      });

      console.log("Formatted recurring tasks:", formattedTasks);
      setRecurringTasks(formattedTasks);
    } catch (error) {
      console.error("Error in fetchRecurringTasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام المتكررة");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, isActive: boolean) => {
    try {
      console.log(`Toggling task ${taskId} status from ${isActive} to ${!isActive}`);
      const { error } = await supabase
        .from('recurring_tasks')
        .update({ is_active: !isActive })
        .eq('id', taskId);

      if (error) {
        console.error('Error toggling task status:', error);
        throw error;
      }

      setRecurringTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, is_active: !isActive } : task
        )
      );

      toast.success(`تم ${!isActive ? 'تفعيل' : 'إيقاف'} المهمة بنجاح`);
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة المتكررة؟')) return;

    try {
      console.log(`Deleting recurring task ${taskId}`);
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }

      setRecurringTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('تم حذف المهمة المتكررة بنجاح');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة');
    }
  };

  const generateTasks = async () => {
    if (!isAdmin) {
      toast.error('لا تملك الصلاحيات الكافية لتنفيذ هذا الإجراء');
      return;
    }

    setIsGenerating(true);
    try {
      console.log("Invoking generate-recurring-tasks function");
      const { data, error } = await supabase.functions.invoke('generate-recurring-tasks');

      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }
      
      console.log('Generate tasks response:', data);
      toast.success(`تم إنشاء ${data.tasksCreated} مهمة بنجاح`);
      
      // Refresh the recurring tasks list after generation
      const { data: refreshedData, error: refreshError } = await supabase
        .from('recurring_tasks')
        .select(`
          id,
          title,
          description,
          recurrence_type,
          interval,
          day_of_month,
          day_of_week,
          priority,
          category,
          project_id,
          workspace_id,
          created_by,
          created_at,
          is_active,
          assign_to,
          last_generated_date,
          next_generation_date,
          requires_deliverable,
          projects:project_id (
            title
          ),
          workspaces:workspace_id (
            name
          ),
          profiles:assign_to (
            display_name
          )
        `)
        .order('created_at', { ascending: false });

      if (refreshError) {
        console.error("Error refreshing tasks:", refreshError);
        throw refreshError;
      }

      // Process refreshed data
      const formattedTasks: RecurringTask[] = refreshedData.map(task => {
        // Some explicit type handling to avoid TypeScript errors
        const formattedTask: RecurringTask = {
          ...task,
          projects: task.projects as { title: string } | null,
          workspaces: task.workspaces as { name: string } | null,
          profiles: task.profiles as { display_name: string } | null,
          project_name: task.projects ? (task.projects as { title: string }).title : null,
          workspace_name: task.workspaces ? (task.workspaces as { name: string }).name : null,
          assignee_name: task.profiles ? (task.profiles as { display_name: string }).display_name : null,
        };
        return formattedTask;
      });

      setRecurringTasks(formattedTasks);
    } catch (error) {
      console.error('Error generating tasks:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء المهام';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    recurringTasks,
    isLoading,
    isAdmin,
    isGenerating,
    toggleTaskStatus,
    deleteTask,
    generateTasks
  };
};
