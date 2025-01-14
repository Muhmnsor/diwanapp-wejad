import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DashboardData } from "@/types/dashboard";

export const useDashboardData = () => {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardData> => {
      console.log("🔄 جاري تحميل إحصائيات لوحة المعلومات...");

      // Get portfolios
      const { data: portfolios, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("*");

      if (portfoliosError) {
        console.error("Error fetching portfolios:", portfoliosError);
        throw portfoliosError;
      }

      // Get tasks
      const { data: tasks, error: tasksError } = await supabase
        .from("portfolio_tasks")
        .select("*");

      if (tasksError) {
        console.error("Error fetching tasks:", tasksError);
        throw tasksError;
      }

      console.log("Raw portfolios data:", portfolios);
      console.log("Raw tasks data:", tasks);

      // Calculate portfolio stats
      const activePortfolios = portfolios?.filter(p => p.sync_enabled).length || 0;
      const completedPortfolios = portfolios?.filter(p => !p.sync_enabled).length || 0;
      const syncedPortfolios = portfolios?.filter(p => p.last_sync_at).length || 0;

      // Calculate task stats
      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
      const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
      const overdueTasks = tasks?.filter(t => {
        if (!t.due_date) return false;
        return new Date(t.due_date) < new Date() && t.status !== 'completed';
      }).length || 0;

      // Prepare chart data
      const tasksByStatus = [
        { name: 'مكتمل', value: completedTasks },
        { name: 'قيد التنفيذ', value: inProgressTasks },
        { name: 'متأخر', value: overdueTasks }
      ];

      const tasksByPriority = [
        { name: 'عالي', value: tasks?.filter(t => t.priority === 'high').length || 0 },
        { name: 'متوسط', value: tasks?.filter(t => t.priority === 'medium').length || 0 },
        { name: 'منخفض', value: tasks?.filter(t => t.priority === 'low').length || 0 }
      ];

      // Group tasks by portfolio
      const tasksByPortfolio = portfolios?.map(p => ({
        name: p.name,
        value: tasks?.filter(t => t.workspace_id === p.id).length || 0
      })) || [];

      // Group tasks by month
      const monthNames = [
        'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
      ];

      const tasksByMonth = monthNames.map(month => ({
        name: month,
        value: tasks?.filter(t => {
          if (!t.created_at) return false;
          return new Date(t.created_at).getMonth() === monthNames.indexOf(month);
        }).length || 0
      }));

      return {
        // Portfolio stats
        totalPortfolios: portfolios?.length || 0,
        activePortfolios,
        completedPortfolios,
        syncedPortfolios,

        // Task stats
        totalTasks: tasks?.length || 0,
        completedTasks,
        inProgressTasks,
        overdueTasks,

        // Charts
        tasksByStatus,
        tasksByPriority,
        tasksByPortfolio,
        tasksByMonth
      };
    }
  });
};