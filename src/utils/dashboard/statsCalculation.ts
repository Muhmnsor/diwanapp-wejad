import type { DashboardData } from "@/types/dashboard";

export const calculateTotalStats = (data: any[]): Partial<DashboardData> => {
  return {
    totalTasks: data.length,
    completedTasks: data.filter(item => item.status === 'completed').length,
    inProgressTasks: data.filter(item => item.status === 'in_progress').length,
    overdueTasks: data.filter(item => {
      if (!item.due_date) return false;
      return new Date(item.due_date) < new Date() && item.status !== 'completed';
    }).length
  };
};

export const calculateEventRankings = (data: any[]): Partial<DashboardData> => {
  const portfolioStats = data.reduce((acc, curr) => {
    const portfolioId = curr.portfolio_id;
    if (!acc[portfolioId]) {
      acc[portfolioId] = 0;
    }
    acc[portfolioId]++;
    return acc;
  }, {});

  return {
    tasksByPortfolio: Object.entries(portfolioStats).map(([id, count]) => ({
      name: id,
      value: count as number
    }))
  };
};