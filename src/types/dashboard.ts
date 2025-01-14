export interface EventStats {
  title: string;
  registrations?: number;
  rating?: number;
  attendanceRate?: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

export interface PortfolioStats {
  total: number;
  active: number;
  completed: number;
  synced: number;
  syncRate: number;
}

export interface DashboardData {
  // Portfolio Statistics
  portfolioStats: PortfolioStats;
  taskStats: TaskStats;
  
  // Task Progress Charts
  tasksByStatus: ChartData[];
  tasksByPriority: ChartData[];
  tasksByPortfolio: ChartData[];
  tasksByMonth: ChartData[];
  
  // Top Performers
  mostActivePortfolio: {
    name: string;
    taskCount: number;
    completionRate: number;
  };
  mostProductiveUser: {
    name: string;
    completedTasks: number;
    completionRate: number;
  };
}