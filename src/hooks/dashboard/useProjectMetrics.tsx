import { useMemo } from 'react';

interface Activity {
  id: string;
  title: string;
  date: string;
  attendance_records: any[];
  activity_feedback: any[];
}

export const useProjectMetrics = (
  projectData: any,
  registrations: any[],
  projectActivities: Activity[]
) => {
  return useMemo(() => {
    console.log("Calculating project metrics");

    const registrationCount = registrations.length;
    const remainingSeats = projectData?.max_attendees ? projectData.max_attendees - registrationCount : 0;
    const occupancyRate = projectData?.max_attendees ? (registrationCount / projectData.max_attendees) * 100 : 0;

    // Calculate completed activities
    const completedActivities = projectActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      return activityDate < new Date();
    });

    // Calculate average attendance
    const averageAttendance = completedActivities.reduce((sum, activity) => {
      const presentCount = activity.attendance_records?.filter(
        record => record.status === 'present'
      ).length || 0;
      
      return sum + ((presentCount / registrationCount) * 100);
    }, 0) / (completedActivities.length || 1);

    // Calculate activity stats
    const activityStats = {
      total: projectActivities.length,
      completed: completedActivities.length,
      averageAttendance: Math.round(averageAttendance),
      highestAttendance: null as any,
      lowestAttendance: null as any,
      highestRated: null as any,
      lowestRated: null as any
    };

    // Calculate attendance rankings
    const activitiesWithStats = completedActivities.map(activity => {
      const presentCount = activity.attendance_records?.filter(
        record => record.status === 'present'
      ).length || 0;
      
      const attendanceRate = registrationCount ? (presentCount / registrationCount) * 100 : 0;
      
      const ratings = activity.activity_feedback?.map(f => f.overall_rating).filter(Boolean) || [];
      const averageRating = ratings.length ? 
        ratings.reduce((sum: number, rating: number) => sum + rating, 0) / ratings.length : 0;

      return {
        eventId: activity.id,
        title: activity.title,
        date: activity.date,
        attendanceRate,
        count: presentCount,
        totalRegistrations: registrationCount,
        averageRating,
        ratingsCount: ratings.length
      };
    });

    if (activitiesWithStats.length > 0) {
      const sortedByAttendance = [...activitiesWithStats].sort((a, b) => b.attendanceRate - a.attendanceRate);
      activityStats.highestAttendance = sortedByAttendance[0];
      activityStats.lowestAttendance = sortedByAttendance[sortedByAttendance.length - 1];

      const withRatings = activitiesWithStats.filter(a => a.ratingsCount > 0);
      if (withRatings.length > 0) {
        const sortedByRating = [...withRatings].sort((a, b) => b.averageRating - a.averageRating);
        activityStats.highestRated = sortedByRating[0];
        activityStats.lowestRated = sortedByRating[sortedByRating.length - 1];
      }
    }

    return {
      registrationCount,
      remainingSeats,
      occupancyRate,
      activitiesStats: activityStats
    };
  }, [projectData, registrations, projectActivities]);
};