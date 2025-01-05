export interface EventStats {
  title: string;
  registrations: number;
  rating?: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  totalEvents: number;
  totalProjects: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  mostRegisteredEvent: EventStats;
  leastRegisteredEvent: EventStats;
  highestRatedEvent: EventStats;
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
}