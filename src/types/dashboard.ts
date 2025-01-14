export interface TaskStats {
  title: string;
  count?: number;
  status?: string;
  dueDate?: string;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  // Portfolio Stats
  totalPortfolios: number;
  activePortfolios: number;
  completedPortfolios: number;
  syncedPortfolios: number;
  
  // Task Stats
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  
  // Task Rankings
  highPriorityTasks: TaskStats;
  recentlyCompletedTasks: TaskStats;
  upcomingDeadlines: TaskStats;
  
  // Charts Data
  tasksByStatus: ChartData[];
  tasksByPriority: ChartData[];
  tasksByPortfolio: ChartData[];
  tasksByMonth: ChartData[];
}