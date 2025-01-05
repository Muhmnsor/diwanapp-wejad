export interface EventStats {
  title: string;
  registrations: number;
  rating?: number;
  attendanceCount?: number;
  totalRegistrations?: number;
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
  totalAttendance: number;
  overallAverageRating: number;
  mostRegisteredEvent: EventStats;
  leastRegisteredEvent: EventStats;
  highestRatedEvent: EventStats;
  lowestRatedEvent: EventStats;
  mostAttendedEvent: EventStats;
  leastAttendedEvent: EventStats;
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
}