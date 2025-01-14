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

export interface DashboardData {
  totalEvents: number;
  eventsCount: number;
  projectsCount: number;
  upcomingEvents: number;
  pastEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
  totalAttendance: number;
  averageAttendanceRate: number;
  averageRating: number;
  mostRegisteredEvent: EventStats;
  leastRegisteredEvent: EventStats;
  highestRatedEvent: EventStats;
  lowestRatedEvent: EventStats;
  highestAttendanceEvent: EventStats;
  lowestAttendanceEvent: EventStats;
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
  eventsByMonth: ChartData[];
}