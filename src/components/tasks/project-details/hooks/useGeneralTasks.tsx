
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

export const useGeneralTasks = () => {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByCategory, setTasksByCategory] = useState<Record<string, Task[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    delayed: 0,
    upcoming: 0
  });

  const fetchGeneralTasks = async () => {
    setIsLoading(true);
    try {
      const { data: authUser } = await supabase.auth.getUser();
      const currentUser = authUser?.user;
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*, profiles:created_by(display_name, email)')
        .eq('is_general', true)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const enrichedTasks = await Promise.all((data || []).map(async (task) => {
        // Process assigned user name
        let assignedUserName = null;
        if (task.assigned_to) {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.assigned_to)
            .single();
          
          if (!userError && userData) {
            assignedUserName = userData.display_name || userData.email;
          }
        }
        
        // Get creator name from joined profiles
        const creatorProfile = task.profiles;
        const creatorName = creatorProfile?.display_name || creatorProfile?.email || 'مستخدم';
        
        return {
          ...task,
          assigned_user_name: assignedUserName,
          creator_name: creatorName
        };
      }));
      
      setTasks(enrichedTasks);
      
      // Group tasks by category
      const categorizedTasks = {};
      const categories = new Set();
      
      enrichedTasks.forEach(task => {
        const category = task.category || 'عام';
        categories.add(category);
        
        if (!categorizedTasks[category]) {
          categorizedTasks[category] = [];
        }
        categorizedTasks[category].push(task);
      });
      
      setTasksByCategory(categorizedTasks);
      setCategories(Array.from(categories) as string[]);
      
      // Calculate statistics
      let total = enrichedTasks.length;
      let completed = 0;
      let pending = 0;
      let inProgress = 0;
      let delayed = 0;
      let upcoming = 0;
      
      const now = new Date();
      
      enrichedTasks.forEach(task => {
        switch (task.status) {
          case 'completed':
            completed++;
            break;
          case 'pending':
            pending++;
            break;
          case 'in_progress':
            inProgress++;
            break;
          case 'delayed':
            delayed++;
            break;
        }
        
        // Check for upcoming tasks (due date in the future)
        if (task.due_date && new Date(task.due_date) > now && task.status !== 'completed') {
          upcoming++;
        }
      });
      
      setStats({
        total,
        completed,
        pending,
        inProgress,
        delayed,
        upcoming
      });
    } catch (error) {
      console.error("Error fetching general tasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام العامة");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneralTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      console.log(`Updating general task ${taskId} status to ${newStatus}`);
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
      
      if (error) {
        console.error("Error updating task status:", error);
        throw error;
      }
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Update tasks by category state
      setTasksByCategory(prevTasksByCategory => {
        const updatedTasksByCategory = { ...prevTasksByCategory };
        
        for (const category in updatedTasksByCategory) {
          updatedTasksByCategory[category] = updatedTasksByCategory[category].map(task => 
            task.id === taskId ? { ...task, status: newStatus } : task
          );
        }
        
        return updatedTasksByCategory;
      });
      
      // Update stats
      fetchGeneralTasks(); // Re-fetch to update stats correctly
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error in handleStatusChange:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      console.log(`Deleting general task ${taskId}`);
      
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        console.error("Error deleting task:", error);
        throw error;
      }
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Update tasks by category state
      setTasksByCategory(prevTasksByCategory => {
        const updatedTasksByCategory = { ...prevTasksByCategory };
        
        for (const category in updatedTasksByCategory) {
          updatedTasksByCategory[category] = updatedTasksByCategory[category].filter(task => 
            task.id !== taskId
          );
        }
        
        return updatedTasksByCategory;
      });
      
      // Update stats
      fetchGeneralTasks(); // Re-fetch to update stats correctly
      
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error in deleteTask:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  };

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
