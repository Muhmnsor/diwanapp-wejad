
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useGeneralTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByCategory, setTasksByCategory] = useState<Record<string, Task[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    delayed: 0,
    upcoming: 0
  });

  const fetchGeneralTasks = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching general tasks");
      
      // Get tasks
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('is_general', true)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error fetching general tasks:", error);
        throw error;
      }
      
      console.log("Fetched general tasks:", data);
      
      // Add user names for tasks with assignees
      const tasksWithUserData = await Promise.all((data || []).map(async (task) => {
        if (task.assigned_to) {
          // Check if it's a custom assignee
          if (task.assigned_to.startsWith('custom:')) {
            return {
              ...task,
              assigned_user_name: task.assigned_to.replace('custom:', '')
            };
          }
          
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.assigned_to)
            .single();
          
          if (!userError && userData) {
            return {
              ...task,
              assigned_user_name: userData.display_name || userData.email
            };
          }
        }
        
        return task;
      }));
      
      // Group tasks by category
      const tasksByCategoryMap: Record<string, Task[]> = {};
      const uniqueCategories = new Set<string>();
      
      tasksWithUserData.forEach(task => {
        const category = task.category || 'أخرى';
        uniqueCategories.add(category);
        
        if (!tasksByCategoryMap[category]) {
          tasksByCategoryMap[category] = [];
        }
        tasksByCategoryMap[category].push(task);
      });
      
      // Calculate stats
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      const total = tasksWithUserData.length;
      const completed = tasksWithUserData.filter(task => task.status === 'completed').length;
      const pending = tasksWithUserData.filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      ).length;
      const delayed = tasksWithUserData.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== 'completed';
      }).length;
      const upcoming = tasksWithUserData.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate > now && dueDate <= oneWeekFromNow && task.status !== 'completed';
      }).length;
      
      setTasks(tasksWithUserData);
      setTasksByCategory(tasksByCategoryMap);
      setCategories(Array.from(uniqueCategories));
      setStats({
        total,
        completed,
        pending,
        delayed,
        upcoming
      });
      
    } catch (error) {
      console.error("Error fetching general tasks:", error);
      toast.error("حدث خطأ أثناء استرجاع المهام العامة");
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
