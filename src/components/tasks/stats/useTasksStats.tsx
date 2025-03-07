
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export interface TasksStatsData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  upcomingDeadlines: number;
  delayedTasks: number;
}

export const useTasksStats = () => {
  const { user } = useAuthStore();
  
  return useQuery({
    queryKey: ['tasks-stats', user?.id],
    queryFn: async (): Promise<TasksStatsData> => {
      if (!user?.id) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          upcomingDeadlines: 0,
          delayedTasks: 0
        };
      }
      
      // Fetch tasks from portfolio_tasks table that are assigned to the current user
      const { data: userTasks, error } = await supabase
        .from('portfolio_tasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (error) {
        console.error("Error fetching portfolio tasks stats:", error);
        throw error;
      }
      
      // Fetch tasks from the regular tasks table that are assigned to the current user
      const { data: regularTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (tasksError) {
        console.error("Error fetching tasks stats:", tasksError);
        throw tasksError;
      }
      
      // Fetch subtasks assigned to the current user
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (subtasksError) {
        console.error("Error fetching subtasks stats:", subtasksError);
        throw subtasksError;
      }
      
      // Combine all tasks arrays - only those specifically assigned to the current user
      const allTasks = [
        ...(userTasks || []), 
        ...(regularTasks || []),
        ...(subtasks || [])
      ];
      
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      // Calculate stats from the fetched data
      const totalTasks = allTasks.length || 0;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length || 0;
      
      // Count both pending and in_progress as pending tasks
      const pendingTasks = allTasks.filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      ).length || 0;
      
      const delayedTasks = allTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate < now && task.status !== 'completed';
      }).length || 0;
      
      const upcomingDeadlines = allTasks.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        return dueDate > now && dueDate <= oneWeekFromNow && task.status !== 'completed';
      }).length || 0;
      
      console.log('Calculated user tasks stats:', { 
        totalTasks, 
        completedTasks, 
        pendingTasks, 
        upcomingDeadlines,
        delayedTasks 
      });
      
      return {
        totalTasks,
        completedTasks,
        pendingTasks,
        upcomingDeadlines,
        delayedTasks
      };
    },
    enabled: !!user?.id
  });
};
