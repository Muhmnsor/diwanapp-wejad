export interface EventStats {
  title: string;
  registrations: number;
  rating?: number;
  attendance?: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface DashboardData {
  totalEvents: number;
  eventsCount: number;
  projectsCount: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  mostRegisteredEvent: EventStats;
  leastRegisteredEvent: EventStats;
  highestRatedEvent: EventStats;
  mostAttendedEvent: EventStats;
  leastAttendedEvent: EventStats;
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
}