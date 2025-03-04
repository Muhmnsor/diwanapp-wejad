
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { AssignedTasksList } from "./AssignedTasksList";
import { TasksStats } from "./TasksStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/refactored-auth";

export const TasksOverview = () => {
  const { user } = useAuthStore();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tasks-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          upcomingDeadlines: 0,
          delayedTasks: 0
        };
      }
      
      // Fetch tasks from portfolio_tasks table
      const { data: userTasks, error } = await supabase
        .from('portfolio_tasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (error) {
        console.error("Error fetching portfolio tasks stats:", error);
        throw error;
      }
      
      // Fetch tasks from the regular tasks table
      const { data: regularTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('status, due_date')
        .eq('assigned_to', user.id);
      
      if (tasksError) {
        console.error("Error fetching tasks stats:", tasksError);
        throw tasksError;
      }
      
      // Combine both tasks arrays
      const allTasks = [...(userTasks || []), ...(regularTasks || [])];
      
      const now = new Date();
      const oneWeekFromNow = new Date();
      oneWeekFromNow.setDate(now.getDate() + 7);
      
      // Calculate stats from the fetched data
      const totalTasks = allTasks.length || 0;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length || 0;
      const pendingTasks = allTasks.filter(task => task.status === 'pending').length || 0;
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">إحصائيات المهام</h2>
          <TasksStats stats={stats} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">جميع المهام المكلف بها</h2>
          <AssignedTasksList />
        </CardContent>
      </Card>
    </div>
  );
};
