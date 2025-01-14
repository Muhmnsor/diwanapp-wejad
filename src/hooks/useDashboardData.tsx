import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DashboardData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["portfolio-dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get portfolios data
      const { data: portfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("*");

      if (portfoliosError) {
        console.error("Error fetching portfolios:", portfoliosError);
        throw portfoliosError;
      }

      // Get tasks data
      const { data: tasks, error: tasksError } = await supabase
        .from("portfolio_tasks")
        .select(`
          *,
          portfolio_projects (
            portfolio_id
          )
        `);

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }

      console.log("📊 Calculating dashboard statistics...");

      // Calculate portfolio stats
      const portfolioStats = {
        total: portfolios.length,
        active: portfolios.filter(p => p.sync_enabled).length,
        completed: portfolios.filter(p => !p.sync_enabled).length,
        synced: portfolios.filter(p => p.last_sync_at).length,
        syncRate: portfolios.length > 0 
          ? (portfolios.filter(p => p.last_sync_at).length / portfolios.length) * 100 
          : 0
      };

      // Calculate task stats
      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        overdue: tasks.filter(t => {
          const dueDate = new Date(t.due_date);
          return dueDate < new Date() && t.status !== 'completed';
        }).length,
        completionRate: tasks.length > 0 
          ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 
          : 0
      };

      // Calculate tasks by status chart data
      const tasksByStatus: ChartData[] = [
        { name: 'مكتملة', value: taskStats.completed },
        { name: 'قيد التنفيذ', value: taskStats.inProgress },
        { name: 'متأخرة', value: taskStats.overdue }
      ];

      // Calculate tasks by priority
      const tasksByPriority = Object.entries(
        tasks.reduce((acc: Record<string, number>, task) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      // Calculate tasks by portfolio
      const tasksByPortfolio = Object.entries(
        tasks.reduce((acc: Record<string, number>, task) => {
          const portfolioId = task.portfolio_projects?.portfolio_id;
          if (portfolioId) {
            acc[portfolioId] = (acc[portfolioId] || 0) + 1;
          }
          return acc;
        }, {})
      ).map(([portfolioId, value]) => {
        const portfolio = portfolios.find(p => p.id === portfolioId);
        return { 
          name: portfolio?.name || 'غير معروف', 
          value 
        };
      });

      // Calculate tasks by month
      const tasksByMonth = Object.entries(
        tasks.reduce((acc: Record<string, number>, task) => {
          const month = new Date(task.created_at).toLocaleString('ar-SA', { month: 'long' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {})
      ).map(([name, value]) => ({ name, value }));

      // Find most active portfolio
      const portfolioActivity = portfolios.map(portfolio => {
        const portfolioTasks = tasks.filter(t => 
          t.portfolio_projects?.portfolio_id === portfolio.id
        );
        return {
          name: portfolio.name,
          taskCount: portfolioTasks.length,
          completionRate: portfolioTasks.length > 0
            ? (portfolioTasks.filter(t => t.status === 'completed').length / portfolioTasks.length) * 100
            : 0
        };
      });

      const mostActivePortfolio = portfolioActivity.reduce((prev, current) => 
        (current.taskCount > prev.taskCount) ? current : prev
      , portfolioActivity[0] || { name: 'لا يوجد', taskCount: 0, completionRate: 0 });

      // Find most productive user
      const userActivity = Object.entries(
        tasks.reduce((acc: Record<string, { completed: number, total: number }>, task) => {
          if (task.assigned_to) {
            if (!acc[task.assigned_to]) {
              acc[task.assigned_to] = { completed: 0, total: 0 };
            }
            acc[task.assigned_to].total++;
            if (task.status === 'completed') {
              acc[task.assigned_to].completed++;
            }
          }
          return acc;
        }, {})
      ).map(([userId, stats]) => ({
        name: userId, // يمكن استبدالها باسم المستخدم من جدول الملفات الشخصية
        completedTasks: stats.completed,
        completionRate: (stats.completed / stats.total) * 100
      }));

      const mostProductiveUser = userActivity.reduce((prev, current) => 
        (current.completedTasks > prev.completedTasks) ? current : prev
      , userActivity[0] || { name: 'لا يوجد', completedTasks: 0, completionRate: 0 });

      console.log("✅ تم حساب إحصائيات لوحة المعلومات");

      return {
        portfolioStats,
        taskStats,
        tasksByStatus,
        tasksByPriority,
        tasksByPortfolio,
        tasksByMonth,
        mostActivePortfolio,
        mostProductiveUser
      };
    }
  });
};