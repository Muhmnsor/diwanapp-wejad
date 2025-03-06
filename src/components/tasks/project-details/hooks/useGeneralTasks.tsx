
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "../types/task";

interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  in_progress: number;
  delayed: number;
}

export const useGeneralTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    in_progress: 0,
    delayed: 0
  });

  // Compute tasks by category
  const tasksByCategory = useMemo(() => {
    const categorizedTasks: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      const category = task.category || "عام";
      if (!categorizedTasks[category]) {
        categorizedTasks[category] = [];
      }
      categorizedTasks[category].push(task);
    });
    
    return categorizedTasks;
  }, [tasks]);
  
  // Get unique categories
  const categories = useMemo(() => {
    return Object.keys(tasksByCategory);
  }, [tasksByCategory]);

  const fetchGeneralTasks = async () => {
    setIsLoading(true);
    try {
      // Fetch general tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles(display_name, email)')
        .eq('is_general', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Process tasks with user info
      const processedTasks = data.map(task => ({
        ...task,
        assigned_user_name: task.assigned_to 
          ? (task.profiles?.display_name || task.profiles?.email || "مستخدم")
          : null
      }));
      
      setTasks(processedTasks);
      
      // Calculate stats
      const newStats = {
        total: processedTasks.length,
        completed: processedTasks.filter(t => t.status === 'completed').length,
        pending: processedTasks.filter(t => t.status === 'pending').length,
        in_progress: processedTasks.filter(t => t.status === 'in_progress').length,
        delayed: processedTasks.filter(t => t.status === 'delayed').length
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error("Error fetching general tasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام العامة");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Optimistic UI update
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      
      setTasks(updatedTasks);
      
      // Update in database
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      toast.success("تم تحديث حالة المهمة");
      
      // Update stats
      const newStats = {
        total: updatedTasks.length,
        completed: updatedTasks.filter(t => t.status === 'completed').length,
        pending: updatedTasks.filter(t => t.status === 'pending').length,
        in_progress: updatedTasks.filter(t => t.status === 'in_progress').length,
        delayed: updatedTasks.filter(t => t.status === 'delayed').length
      };
      
      setStats(newStats);
      
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
      // Revert UI in case of error
      fetchGeneralTasks();
    }
  };
  
  const deleteTask = async (taskId: string) => {
    try {
      // Optimistic UI update
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
      
      // Update stats
      const newStats = {
        total: updatedTasks.length,
        completed: updatedTasks.filter(t => t.status === 'completed').length,
        pending: updatedTasks.filter(t => t.status === 'pending').length,
        in_progress: updatedTasks.filter(t => t.status === 'in_progress').length,
        delayed: updatedTasks.filter(t => t.status === 'delayed').length
      };
      
      setStats(newStats);
      
      toast.success("تم حذف المهمة بنجاح");
      
    } catch (error) {
      console.error("Error handling task deletion:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
      // Revert changes in case of error
      fetchGeneralTasks();
    }
  };

  useEffect(() => {
    fetchGeneralTasks();
  }, []);

  return {
    tasks,
    isLoading,
    tasksByCategory,
    categories,
    stats,
    fetchGeneralTasks,
    handleStatusChange,
    deleteTask
  };
};
