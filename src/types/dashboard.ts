export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  // Portfolio stats
  totalPortfolios: number;
  activePortfolios: number;
  completedPortfolios: number;
  syncedPortfolios: number;

  // Task stats
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;

  // Charts
  tasksByStatus: ChartData[];
  tasksByPriority: ChartData[];
  tasksByPortfolio: ChartData[];
  tasksByMonth: ChartData[];
}