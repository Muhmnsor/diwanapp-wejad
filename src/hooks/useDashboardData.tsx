import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get portfolios data
      const { data: portfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select(`
          *,
          portfolio_tasks (
            id,
            title,
            status,
            priority,
            due_date
          )
        `);

      if (portfoliosError) {
        console.error("Error fetching portfolios:", portfoliosError);
        throw portfoliosError;
      }

      // Calculate portfolio stats
      const totalPortfolios = portfolios?.length || 0;
      const activePortfolios = portfolios?.filter(p => p.sync_enabled).length || 0;
      const syncedPortfolios = portfolios?.filter(p => p.last_sync_at).length || 0;
      const completedPortfolios = portfolios?.filter(p => !p.sync_enabled).length || 0;

      // Aggregate all tasks
      const allTasks = portfolios?.flatMap(p => p.portfolio_tasks) || [];
      
      // Calculate task stats
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter(t => t.status === 'completed').length;
      const inProgressTasks = allTasks.filter(t => t.status === 'in_progress').length;
      const overdueTasks = allTasks.filter(t => {
        const dueDate = new Date(t.due_date);
        return dueDate < new Date() && t.status !== 'completed';
      }).length;

      // Get high priority tasks
      const highPriorityTask = allTasks.find(t => t.priority === 'high' && t.status !== 'completed');
      
      // Get recently completed task
      const recentlyCompletedTask = allTasks
        .filter(t => t.status === 'completed')
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0];

      // Calculate chart data
      const tasksByStatus = Object.entries(
        allTasks.reduce((acc: Record<string, number>, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      const tasksByPriority = Object.entries(
        allTasks.reduce((acc: Record<string, number>, task) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      const tasksByMonth = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthTasks = allTasks.filter(t => {
          const taskDate = new Date(t.due_date);
          return taskDate.getMonth() === month.getMonth() &&
                 taskDate.getFullYear() === month.getFullYear();
        });
        return {
          name: month.toLocaleString('ar-SA', { month: 'long' }),
          value: monthTasks.length
        };
      }).reverse();

      return {
        // Portfolio stats
        totalPortfolios,
        activePortfolios,
        completedPortfolios,
        syncedPortfolios,

        // Task stats
        totalTasks,
        completedTasks,
        inProgressTasks,
        overdueTasks,

        // Task rankings
        highPriorityTasks: {
          title: highPriorityTask?.title || 'لا توجد مهام عاجلة',
          count: allTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length
        },
        recentlyCompletedTasks: {
          title: recentlyCompletedTask?.title || 'لا توجد مهام مكتملة',
          count: completedTasks
        },
        upcomingDeadlines: {
          title: 'المهام القادمة',
          count: allTasks.filter(t => {
            const dueDate = new Date(t.due_date);
            const today = new Date();
            const weekFromNow = new Date();
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate > today && dueDate <= weekFromNow;
          }).length
        },

        // Charts data
        tasksByStatus,
        tasksByPriority,
        tasksByPortfolio: portfolios?.map(p => ({
          name: p.name,
          value: p.portfolio_tasks?.length || 0
        })) || [],
        tasksByMonth
      };
    }
  });
};