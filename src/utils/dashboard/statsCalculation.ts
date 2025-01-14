import { ChartData, EventStats } from "@/types/dashboard";

export const calculateTotalStats = (allEvents: any[]) => {
  const now = new Date();
  const upcomingEvents = allEvents.filter(event => event.date >= now);
  const pastEvents = allEvents.filter(event => event.date < now);

  const totalRegistrations = allEvents.reduce((sum, event) => sum + (event.registrationCount || 0), 0);
  const totalAttendance = allEvents.reduce((sum, event) => sum + (event.attendanceCount || 0), 0);
  const averageAttendanceRate = totalRegistrations > 0 ? (totalAttendance / totalRegistrations) * 100 : 0;
  const totalRevenue = allEvents.reduce((sum, event) => sum + ((event.price || 0) * (event.registrationCount || 0)), 0);

  return {
    upcomingEvents: upcomingEvents.length,
    pastEvents: pastEvents.length,
    totalRegistrations,
    totalAttendance,
    averageAttendanceRate,
    totalRevenue
  };
};

export const calculateEventRankings = (allEvents: any[]) => {
  const sortedByRegistrations = [...allEvents].sort((a, b) => 
    (b.registrationCount || 0) - (a.registrationCount || 0)
  );

  const eventsWithAttendanceRates = allEvents.map(event => ({
    ...event,
    attendanceRate: event.registrationCount > 0 
      ? (event.attendanceCount / event.registrationCount) * 100 
      : 0
  }));

  const sortedByAttendance = [...eventsWithAttendanceRates].sort((a, b) => 
    (b.attendanceRate || 0) - (a.attendanceRate || 0)
  );

  const eventsWithRatings = allEvents.filter(event => (event.averageRating || 0) > 0);
  const averageRating = eventsWithRatings.length > 0
    ? eventsWithRatings.reduce((sum, event) => sum + (event.averageRating || 0), 0) / eventsWithRatings.length
    : 0;

  const sortedByRating = [...eventsWithRatings].sort((a, b) => 
    (b.averageRating || 0) - (a.averageRating || 0)
  );

  return {
    mostRegisteredEvent: {
      title: sortedByRegistrations[0]?.title || 'لا يوجد',
      registrations: sortedByRegistrations[0]?.registrationCount || 0
    },
    leastRegisteredEvent: {
      title: sortedByRegistrations[sortedByRegistrations.length - 1]?.title || 'لا يوجد',
      registrations: sortedByRegistrations[sortedByRegistrations.length - 1]?.registrationCount || 0
    },
    highestRatedEvent: {
      title: sortedByRating[0]?.title || 'لا يوجد',
      rating: sortedByRating[0]?.averageRating || 0,
      registrations: sortedByRating[0]?.registrationCount || 0
    },
    lowestRatedEvent: {
      title: sortedByRating[sortedByRating.length - 1]?.title || 'لا يوجد',
      rating: sortedByRating[sortedByRating.length - 1]?.averageRating || 0,
      registrations: sortedByRating[sortedByRating.length - 1]?.registrationCount || 0
    },
    highestAttendanceEvent: {
      title: sortedByAttendance[0]?.title || 'لا يوجد',
      attendanceRate: sortedByAttendance[0]?.attendanceRate || 0,
      registrations: sortedByAttendance[0]?.registrationCount || 0
    },
    lowestAttendanceEvent: {
      title: sortedByAttendance[sortedByAttendance.length - 1]?.title || 'لا يوجد',
      attendanceRate: sortedByAttendance[sortedByAttendance.length - 1]?.attendanceRate || 0,
      registrations: sortedByAttendance[sortedByAttendance.length - 1]?.registrationCount || 0
    },
    averageRating
  };
};