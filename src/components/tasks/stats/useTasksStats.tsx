
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
      
    
      
      // Fetch tasks from the regular tasks table
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (tasksError) {
        console.error("Error fetching tasks stats:", tasksError);
        throw tasksError;
      }
      
      // Fetch subtasks assigned to the user
      const { data: userSubtasks, error: subtasksError } = await supabase
        .from('task_subtasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (subtasksError) {
        console.error("Error fetching subtasks stats:", subtasksError);
        throw subtasksError;
      }
      
      // Combine all tasks arrays
      const allAssignedTasks = [
        ...(userTasks || []),
        ...(userSubtasks || [])
      ];
      
      console.log(`Found ${allAssignedTasks.length} tasks assigned to user ID: ${user.id}`);
      console.log(`- Regular tasks: ${userTasks?.length || 0}`);
      console.log(`- Subtasks: ${userSubtasks?.length || 0}`);
      
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      // Calculate stats - each task goes into exactly one category for counting purposes
      const totalTasks = allAssignedTasks.length;
      const completedTasks = allAssignedTasks.filter(task => task.status === 'completed').length;
      
      // Only count tasks with explicit pending status as pending
      // This is the key fix - we no longer include tasks without a due date automatically as pending
      const pendingTasks = allAssignedTasks.filter(task => {
        // Only count as pending if status is explicitly 'pending'
        return task.status === 'pending' || task.status === 'in_progress';
      }).length;
      
      // Count tasks as delayed only if they're not completed and past due date
      const delayedTasks = allAssignedTasks.filter(task => {
        if (task.status === 'completed') return false;
        if (!task.due_date) return false;
        
        const dueDate = new Date(task.due_date);
        return dueDate < now;
      }).length;
      
      // Count tasks as upcoming only if they're not completed and due within the next week
      const upcomingDeadlines = allAssignedTasks.filter(task => {
        if (task.status === 'completed') return false;
        if (!task.due_date) return false;
        
        const dueDate = new Date(task.due_date);
        return dueDate > now && dueDate <= oneWeekFromNow;
      }).length;
      
      // Log detailed stats to help with debugging
      console.log('Calculated user tasks stats:', { 
        totalTasks, 
        completedTasks, 
        pendingTasks, 
        upcomingDeadlines,
        delayedTasks,
        sumOfCategories: completedTasks + pendingTasks + delayedTasks + upcomingDeadlines
      });
      
      // Log individual tasks to help identify issues
      console.log('Tasks by status:');
      console.log('- Completed:', allAssignedTasks.filter(task => task.status === 'completed').length);
      console.log('- Pending/In Progress:', allAssignedTasks.filter(task => 
        task.status === 'pending' || task.status === 'in_progress'
      ).length);
      console.log('- No status specified:', allAssignedTasks.filter(task => !task.status).length);
      
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
