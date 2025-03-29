
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTask, getProjectName, getWorkspaceName, getAssigneeName } from "../types/RecurringTask";
import { useAuthStore } from "@/store/authStore";
import { checkUserPermissions } from "@/components/requests/workflow/hooks/utils/permissionUtils";

export const useRecurringTasks = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRecurringTasks();
  }, [user]);

  const fetchRecurringTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }

      console.log("Checking admin status for user:", user.id);
      
      // First try with the is_admin RPC
      try {
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (isAdminError) {
          console.error("Error checking admin status with is_admin RPC:", isAdminError);
          throw isAdminError;
        }
        
        setIsAdmin(isAdminData || false);
        console.log("Is admin (via RPC):", isAdminData);
      } catch (rpcError) {
        // If the RPC fails, try with the permission util function as a fallback
        console.log("Falling back to permission utils for admin check");
        const { isAdmin: isAdminCheck } = await checkUserPermissions();
        setIsAdmin(isAdminCheck);
        console.log("Is admin (via fallback):", isAdminCheck);
      }

      // Improved query with more detailed console logging
      console.log("Fetching recurring tasks...");
      const { data, error } = await supabase
        .from('recurring_tasks')
        .select(`
          *,
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
        // Extract related names using helper functions
        const projectName = getProjectName(task as RecurringTask);
        const workspaceName = getWorkspaceName(task as RecurringTask);
        const assigneeName = getAssigneeName(task as RecurringTask);

        const formattedTask: RecurringTask = {
          ...task,
          project_name: projectName,
          workspace_name: workspaceName,
          assignee_name: assigneeName,
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
  }, [user]);

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
      
      // Refresh the list after toggling
      fetchRecurringTasks();
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
      fetchRecurringTasks();
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
    generateTasks,
    fetchRecurringTasks  // Export the function so it can be called from other components
  };
};
