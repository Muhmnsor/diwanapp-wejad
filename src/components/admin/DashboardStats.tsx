import { RegistrationStatsCard } from "./dashboard/stats/RegistrationStatsCard";
import { PathCategoryCard } from "./dashboard/stats/PathCategoryCard";
import { ActivitiesStatsCard } from "./dashboard/stats/ActivitiesStatsCard";
import { ActivityAttendanceCard } from "./dashboard/stats/ActivityAttendanceCard";
import { ActivityRatingCard } from "./dashboard/stats/ActivityRatingCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStatsProps {
  registrationCount: number;
  remainingSeats: number;
  occupancyRate: number;
  project: {
    id: string;
    start_date: string;
    end_date: string;
    event_path: string;
    event_category: string;
  };
  activities: {
    total: number;
    completed: number;
    averageAttendance: number;
  };
  isEvent?: boolean;
}

export const DashboardStats = ({
  registrationCount,
  remainingSeats,
  occupancyRate,
  project,
  activities,
  isEvent = false
}: DashboardStatsProps) => {
  console.log("DashboardStats props:", {
    registrationCount,
    remainingSeats,
    occupancyRate,
    project,
    activities,
    isEvent
  });

  const { data: attendanceStats } = useQuery({
    queryKey: ['project-activities-attendance', project.id],
    queryFn: async () => {
      // Get all activities for this project
      const { data: projectActivities } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          attendance_records!attendance_records_activity_id_fkey(*)
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true)
        .order('date', { ascending: true });

      if (!projectActivities?.length) return { highest: null, lowest: null };

      // Get total registrations for the project
      const { data: registrations } = await supabase
        .from('registrations')
        .select('id')
        .eq('project_id', project.id);

      const totalRegistrations = registrations?.length || 0;

      // Calculate attendance percentage for each activity
      const activitiesWithStats = projectActivities.map(activity => ({
        title: activity.title,
        date: activity.date,
        attendanceCount: activity.attendance_records.filter(record => record.status === 'present').length,
        totalRegistrations,
        percentage: totalRegistrations > 0 
          ? (activity.attendance_records.filter(record => record.status === 'present').length / totalRegistrations) * 100
          : 0
      }));

      // Sort by percentage and date
      const sortedActivities = activitiesWithStats.sort((a, b) => {
        if (a.percentage === b.percentage) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return b.percentage - a.percentage;
      });

      return {
        highest: sortedActivities[0] || null,
        lowest: sortedActivities[sortedActivities.length - 1] || null
      };
    },
    enabled: !isEvent && !!project.id
  });

  const { data: ratingStats } = useQuery({
    queryKey: ['project-activities-ratings', project.id],
    queryFn: async () => {
      console.log('Fetching activity ratings for project:', project.id);
      
      // Get all activities with their feedback
      const { data: activitiesWithFeedback } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          event_feedback(
            overall_rating
          )
        `)
        .eq('project_id', project.id)
        .eq('is_project_activity', true);

      if (!activitiesWithFeedback?.length) {
        console.log('No activities found with feedback');
        return { highest: null, lowest: null };
      }

      // Calculate average rating for each activity
      const activitiesWithRatings = activitiesWithFeedback
        .map(activity => ({
          title: activity.title,
          date: activity.date,
          rating: activity.event_feedback.length > 0
            ? activity.event_feedback.reduce((sum: number, feedback: any) => sum + (feedback.overall_rating || 0), 0) / activity.event_feedback.length
            : 0
        }))
        .filter(activity => activity.rating > 0);

      if (!activitiesWithRatings.length) {
        console.log('No activities found with ratings');
        return { highest: null, lowest: null };
      }

      // Sort by rating and get highest and lowest
      const sortedActivities = [...activitiesWithRatings].sort((a, b) => {
        if (a.rating === b.rating) {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
        return b.rating - a.rating;
      });

      console.log('Activities with ratings:', sortedActivities);

      return {
        highest: sortedActivities[0] || null,
        lowest: sortedActivities[sortedActivities.length - 1] || null
      };
    },
    enabled: !isEvent && !!project.id
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <RegistrationStatsCard
        registrationCount={registrationCount}
        remainingSeats={remainingSeats}
        occupancyRate={occupancyRate}
      />
      
      <PathCategoryCard
        eventPath={project.event_path}
        eventCategory={project.event_category}
      />

      {!isEvent && (
        <>
          <ActivityAttendanceCard
            type="highest"
            title="أعلى نسبة حضور"
            activity={attendanceStats?.highest}
          />
          <ActivityAttendanceCard
            type="lowest"
            title="أقل نسبة حضور"
            activity={attendanceStats?.lowest}
          />
          <ActivityRatingCard
            type="highest"
            title="أعلى نشاط تقييماً"
            activity={ratingStats?.highest}
          />
          <ActivityRatingCard
            type="lowest"
            title="أقل نشاط تقييماً"
            activity={ratingStats?.lowest}
          />
          <div className="lg:col-span-4">
            <ActivitiesStatsCard activities={activities} />
          </div>
        </>
      )}
    </div>
  );
};