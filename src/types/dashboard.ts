export interface EventStats {
  title: string;
  registrations: number;
  rating?: number;
}

export interface AttendanceStats {
  title: string;
  attendanceCount: number;
  percentage: number;
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
  lowestRatedEvent: EventStats;
  mostAttendedEvent: AttendanceStats;
  leastAttendedEvent: AttendanceStats;
  averageAttendance: number;
  averageRating: number;
  eventsByType: ChartData[];
  eventsByBeneficiary: ChartData[];
  eventsByBeneficiaryType: ChartData[];
  eventsByPrice: ChartData[];
}