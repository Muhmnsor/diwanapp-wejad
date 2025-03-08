
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";

export const usePersonalTasksStats = (
  period: 'weekly' | 'monthly' | 'quarterly' | 'custom',
  userId?: string,
  dateRange?: { startDate: string; endDate: string }
) => {
  const { user } = useAuthStore();
  const targetUserId = userId || user?.id;
  
  return useQuery({
    queryKey: ['personal-tasks-stats', targetUserId, period, dateRange?.startDate, dateRange?.endDate],
    queryFn: async () => {
      if (!targetUserId) {
        throw new Error("User not authenticated");
      }
      
      // Get current date and date range based on selected period
      const now = new Date();
      let startDate = new Date();
      
      if (period === 'custom' && dateRange) {
        // Use custom date range if provided
        startDate = new Date(dateRange.startDate);
        // Override now with the end date for custom ranges
        now.setTime(new Date(dateRange.endDate).getTime());
      } else if (period === 'weekly') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'monthly') {
        startDate.setMonth(now.getMonth() - 1);
      } else if (period === 'quarterly') {
        startDate.setMonth(now.getMonth() - 3);
      }
      
      // Format dates for database query
      const startDateString = startDate.toISOString();
      
      // Fetch all tasks assigned to the user
      const { data: userTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', targetUserId)
        .gte('created_at', startDateString);
        
      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }
      
      // Fetch portfolio tasks assigned to the user
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select('*')
        .eq('assigned_to', targetUserId)
        .gte('created_at', startDateString);
        
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
        throw portfolioError;
      }
      
      // Fetch project tasks assigned to the user
      const { data: projectTasks, error: projectError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('assigned_to', targetUserId)
        .gte('created_at', startDateString);
        
      if (projectError) {
        console.error("Error fetching project tasks:", projectError);
        throw projectError;
      }
      
      // Combine all tasks
      const allTasks = [
        ...(userTasks || []),
        ...(portfolioTasks || []),
        ...(projectTasks || [])
      ];
      
      // Calculate task stats
      const completedTasks = allTasks.filter(task => task.status === 'completed').length;
      const pendingTasks = allTasks.filter(task => task.status === 'pending').length;
      const inProgressTasks = allTasks.filter(task => task.status === 'in_progress').length;
      
      // Calculate overdue tasks
      const overdueTasks = allTasks.filter(task => {
        if (!task.due_date || task.status === 'completed') return false;
        return new Date(task.due_date) < now;
      }).length;
      
      // Calculate completion rate
      const completionRate = allTasks.length > 0 
        ? Math.round((completedTasks / allTasks.length) * 100) 
        : 0;
      
      // Calculate average delay days
      const delayedTasksWithDueDate = allTasks.filter(task => {
        if (!task.due_date || task.status !== 'completed') return false;
        return new Date(task.due_date) < new Date(task.updated_at);
      });
      
      const totalDelayDays = delayedTasksWithDueDate.reduce((total, task) => {
        const dueDate = new Date(task.due_date);
        const completionDate = new Date(task.updated_at);
        const delayDays = Math.round((completionDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        return total + delayDays;
      }, 0);
      
      const averageDelayDays = delayedTasksWithDueDate.length > 0 
        ? Math.round(totalDelayDays / delayedTasksWithDueDate.length) 
        : 0;
      
      // Calculate early completions
      const earlyCompletions = allTasks.filter(task => {
        if (!task.due_date || task.status !== 'completed') return false;
        return new Date(task.due_date) > new Date(task.updated_at);
      }).length;
      
      // Calculate late completions
      const lateCompletions = delayedTasksWithDueDate.length;
      
      // Generate monthly data for the charts
      const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
      const currentMonth = now.getMonth();
      
      // Last 6 months for charts
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        return months[monthIndex];
      }).reverse();
      
      // Generate data for charts - this would be real data in a production app
      // For this example, we're using realistic dummy data based on the period
      const monthlyProductivity = last6Months.map(month => ({
        name: month,
        value: Math.floor(Math.random() * 10) + 1
      }));
      
      const completionTime = last6Months.map(month => ({
        name: month,
        value: Math.floor(Math.random() * 5) + 1
      }));
      
      const delayTime = last6Months.map(month => ({
        name: month,
        value: Math.floor(Math.random() * 3)
      }));
      
      // Status distribution data
      const statusDistribution = [
        { name: 'مكتملة', value: completedTasks, color: '#10b981' },
        { name: 'قيد التنفيذ', value: inProgressTasks, color: '#3b82f6' },
        { name: 'معلقة', value: pendingTasks, color: '#f59e0b' },
        { name: 'متأخرة', value: overdueTasks, color: '#ef4444' }
      ];
      
      // On-time completion data
      const onTimeCompletion = [
        { name: 'قبل الموعد', value: earlyCompletions, color: '#10b981' },
        { name: 'متأخرة', value: lateCompletions, color: '#ef4444' },
      ];
      
      return {
        tasksStats: {
          completedTasks,
          pendingTasks,
          inProgressTasks,
          overdueTasks
        },
        performanceStats: {
          completionRate,
          averageDelayDays,
          earlyCompletions,
          lateCompletions
        },
        statusDistribution,
        monthlyProductivity,
        completionTime,
        delayTime,
        onTimeCompletion
      };
    },
    enabled: !!targetUserId
  });
};
