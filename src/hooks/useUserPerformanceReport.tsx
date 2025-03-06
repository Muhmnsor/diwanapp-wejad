
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { supabase } from "@/integrations/supabase/client";
import { cachedSupabase } from "@/integrations/supabase/cachedClient";
import { CACHE_DURATIONS } from "@/utils/cacheService";
import { useAuthStore } from "@/store/refactored-auth";
import { QueryKey } from "@tanstack/react-query";

export interface UserAchievement {
  id: string;
  achievement_type: string;
  achievement_title: string;
  achievement_description: string | null;
  achieved_at: string;
  metrics: Record<string, any>;
}

export interface UserPerformanceData {
  summary: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueCount: number;
    completionRate: number;
    onTimeCompletionRate: number;
    averageCompletionTime: number;
  };
  achievements: UserAchievement[];
  tasksByMonth: Array<{ month: string; completed: number; total: number }>;
  tasksByProject: Array<{ projectName: string; count: number; completedCount: number }>;
  tasksByPriority: Array<{ priority: string; count: number }>;
  recentlyCompletedTasks: Array<any>;
  upcomingTasks: Array<any>;
}

export const useUserPerformanceReport = (userId?: string, period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;
  
  const queryKey: QueryKey = ['user-performance-report', targetUserId, period];
  
  return useCachedQuery<UserPerformanceData>(
    queryKey,
    async (): Promise<UserPerformanceData> => {
      if (!targetUserId) {
        throw new Error("User ID is required");
      }
      
      // Get current date and date range based on selected period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarterly') {
        startDate.setMonth(now.getMonth() - 3);
      } else if (period === 'yearly') {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      
      // Format dates for database query
      const startDateString = startDate.toISOString();
      
      // Check if we have pre-calculated stats
      const { data: preCalculatedStats, error: statsError } = await supabase
        .from('user_performance_stats')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('stats_period', period);
        
      if (statsError && statsError.code !== 'PGRST116') {
        console.error("Error fetching pre-calculated stats:", statsError);
      }
      
      // Use Promise.all with cached queries to parallelize requests
      const [
        tasksResponse,
        portfolioTasksResponse,
        projectTasksResponse,
        subtasksResponse
      ] = await Promise.all([
        // Regular tasks
        supabase
          .from('tasks')
          .select('*, project_tasks(title)')
          .eq('assigned_to', targetUserId)
          .gte('created_at', startDateString),
        
        // Portfolio tasks
        supabase
          .from('portfolio_tasks')
          .select('*, portfolio_projects(portfolio_id), portfolios(name)')
          .eq('assigned_to', targetUserId)
          .gte('created_at', startDateString),
        
        // Project tasks
        supabase
          .from('project_tasks')
          .select('*')
          .eq('assigned_to', targetUserId)
          .gte('created_at', startDateString),
          
        // Subtasks
        supabase
          .from('subtasks')
          .select('*, tasks(title)')
          .eq('assigned_to', targetUserId)
          .gte('created_at', startDateString)
      ]);
      
      const { data: tasks, error: tasksError } = tasksResponse;
      const { data: portfolioTasks, error: portfolioTasksError } = portfolioTasksResponse;
      const { data: projectTasks, error: projectTasksError } = projectTasksResponse;
      const { data: subtasks, error: subtasksError } = subtasksResponse;
      
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      if (portfolioTasksError) {
        console.error("Error fetching portfolio tasks:", portfolioTasksError);
        throw portfolioTasksError;
      }
      
      if (projectTasksError) {
        console.error("Error fetching project tasks:", projectTasksError);
        throw projectTasksError;
      }
      
      if (subtasksError) {
        console.error("Error fetching subtasks:", subtasksError);
        throw subtasksError;
      }
      
      // Fetch user achievements
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', targetUserId)
        .order('achieved_at', { ascending: false });
        
      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
      }
      
      // Combine all tasks
      const allTasks = [
        ...(tasks || []).map(t => ({ ...t, type: 'task' })),
        ...(portfolioTasks || []).map(t => ({ ...t, type: 'portfolio' })),
        ...(projectTasks || []).map(t => ({ ...t, type: 'project' })),
        ...(subtasks || []).map(t => ({ ...t, type: 'subtask' }))
      ];
      
      // Calculate summary data
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
      
      // Calculate overdue tasks
      const overdueCount = allTasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        return new Date(task.due_date) < now;
      }).length;
      
      // Calculate completion rate
      const completionRate = totalTasks > 0 
        ? Math.round((completedTasks / totalTasks) * 100) 
        : 0;
      
      // Calculate average completion time and on-time completion rate
      const completedTasksWithDueDate = allTasks.filter(task => 
        task.status === 'completed' && task.due_date && task.updated_at
      );
      
      const onTimeCompletions = completedTasksWithDueDate.filter(task => 
        new Date(task.updated_at) <= new Date(task.due_date)
      ).length;
      
      const onTimeCompletionRate = completedTasksWithDueDate.length > 0
        ? Math.round((onTimeCompletions / completedTasksWithDueDate.length) * 100)
        : 0;
      
      // Calculate average completion time (in hours)
      const totalCompletionTimeHours = completedTasksWithDueDate.reduce((total, task) => {
        const createdDate = new Date(task.created_at);
        const completedDate = new Date(task.updated_at);
        const hoursDiff = Math.round((completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
        return total + hoursDiff;
      }, 0);
      
      const averageCompletionTime = completedTasksWithDueDate.length > 0
        ? Math.round(totalCompletionTimeHours / completedTasksWithDueDate.length)
        : 0;
      
      // Group tasks by month
      const tasksByMonth = [];
      const months = [];
      for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const monthName = d.toLocaleDateString('ar-SA', { month: 'long' });
        months.push({ key: monthKey, name: monthName });
      }
      
      for (const month of months) {
        const monthTasks = allTasks.filter(task => {
          const taskDate = new Date(task.created_at);
          return `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}` === month.key;
        });
        
        const completedInMonth = monthTasks.filter(task => task.status === 'completed').length;
        
        tasksByMonth.push({
          month: month.name,
          total: monthTasks.length,
          completed: completedInMonth
        });
      }
      
      // Group tasks by project
      const projectGroups: Record<string, { count: number; completedCount: number }> = {};
      for (const task of allTasks) {
        let projectName = 'بدون مشروع';
        
        if (task.type === 'task' && task.project_tasks) {
          projectName = task.project_tasks.title;
        } else if (task.type === 'portfolio' && task.portfolios) {
          projectName = task.portfolios.name;
        } else if (task.type === 'project') {
          projectName = task.title;
        } else if (task.type === 'subtask' && task.tasks) {
          projectName = task.tasks.title;
        }
        
        if (!projectGroups[projectName]) {
          projectGroups[projectName] = {
            count: 0,
            completedCount: 0
          };
        }
        
        projectGroups[projectName].count++;
        if (task.status === 'completed') {
          projectGroups[projectName].completedCount++;
        }
      }
      
      const tasksByProject = Object.entries(projectGroups)
        .map(([projectName, data]) => ({
          projectName,
          count: data.count,
          completedCount: data.completedCount
        }))
        .sort((a, b) => b.count - a.count);
      
      // Group tasks by priority
      const priorityGroups: Record<string, number> = {};
      for (const task of allTasks) {
        const priority = task.priority || 'medium';
        
        if (!priorityGroups[priority]) {
          priorityGroups[priority] = 0;
        }
        
        priorityGroups[priority]++;
      }
      
      const tasksByPriority = Object.entries(priorityGroups)
        .map(([priority, count]) => ({
          priority: priority === 'high' ? 'عالية' : priority === 'medium' ? 'متوسطة' : 'منخفضة',
          count: count as number
        }))
        .sort((a, b) => b.count - a.count);
      
      // Get recently completed tasks
      const recentlyCompletedTasks = allTasks
        .filter(task => task.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 5);
      
      // Get upcoming tasks (not completed, with nearest due dates)
      const upcomingTasks = allTasks
        .filter(task => task.status !== 'completed' && task.due_date)
        .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
        .slice(0, 5);
      
      return {
        summary: {
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueCount,
          completionRate,
          onTimeCompletionRate,
          averageCompletionTime
        },
        achievements: achievements || [],
        tasksByMonth,
        tasksByProject,
        tasksByPriority,
        recentlyCompletedTasks,
        upcomingTasks
      };
    },
    {
      queryKey,
      enabled: !!targetUserId,
      cacheDuration: period === 'monthly' ? CACHE_DURATIONS.MEDIUM : CACHE_DURATIONS.LONG,
      cacheStorage: 'local', // Store in localStorage for persistence across sessions
      staleTime: 30 * 60 * 1000, // 30 minutes stale time
      cachePrefix: 'tasks'
    }
  );
};
