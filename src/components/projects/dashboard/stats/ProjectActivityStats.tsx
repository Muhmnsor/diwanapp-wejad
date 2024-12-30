import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";
import { StatCard } from "@/components/admin/dashboard/stats/StatCard";

interface ProjectActivityStatsProps {
  projectId: string;
}

export const ProjectActivityStats = ({ projectId }: ProjectActivityStatsProps) => {
  const { data: activityStats } = useQuery({
    queryKey: ['project-activities-stats', projectId],
    queryFn: async () => {
      console.log('Fetching project activities stats for project:', projectId);
      
      const { data: activities, error } = await supabase
        .from('events')
        .select(`
          id,
          title,
          date,
          attendance_records (
            status
          )
        `)
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (error) {
        console.error('Error fetching project activities:', error);
        throw error;
      }

      console.log('Raw activities data:', activities);

      const currentDate = new Date().toISOString().split('T')[0];
      
      // Calculate completed activities (activities with past dates)
      const completedActivities = activities?.filter(
        (activity: any) => activity.date <= currentDate
      ).length || 0;

      const totalActivities = activities?.length || 0;
      const remainingActivities = totalActivities - completedActivities;

      // Calculate attendance rates for each activity
      const attendanceRates = activities?.map((activity: any) => {
        const totalAttendees = activity.attendance_records?.length || 0;
        const presentAttendees = activity.attendance_records?.filter(
          (record: any) => record.status === 'present'
        ).length || 0;
        
        return totalAttendees > 0 ? (presentAttendees / totalAttendees) * 100 : 0;
      }) || [];

      // Calculate average attendance rate
      const averageAttendanceRate = attendanceRates.length > 0
        ? attendanceRates.reduce((sum: number, rate: number) => sum + rate, 0) / attendanceRates.length
        : 0;

      return {
        totalActivities,
        completedActivities,
        remainingActivities,
        averageAttendanceRate
      };
    },
    initialData: {
      totalActivities: 0,
      completedActivities: 0,
      remainingActivities: 0,
      averageAttendanceRate: 0
    }
  });

  console.log('Activity stats:', activityStats);

  return (
    <StatCard
      title="الأنشطة المتبقية"
      value={`${activityStats.remainingActivities} من ${activityStats.totalActivities}`}
      subtitle={`متوسط نسبة الحضور ${activityStats.averageAttendanceRate.toFixed(1)}%`}
      icon={Activity}
    />
  );
};