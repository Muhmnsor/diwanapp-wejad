import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface RegistrantStats {
  name: string;
  attendedActivities: number;
  totalActivities: number;
  attendancePercentage: number;
}

export const useRegistrantsStats = (projectId?: string) => {
  const { data: registrantsStats = [], isLoading } = useQuery({
    queryKey: ['registrants-stats', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      console.log('Fetching registrants stats for project:', projectId);

      // 1. Get all registrations for this project
      const { data: registrations, error: regError } = await supabase
        .from('registrations')
        .select(`
          id,
          name,
          attendance_records!inner (
            status,
            activity_id
          )
        `)
        .eq('project_id', projectId);

      if (regError) {
        console.error('Error fetching registrations:', regError);
        throw regError;
      }

      console.log('Fetched registrations:', registrations);

      // 2. Get total number of activities for this project
      const { data: activities, error: actError } = await supabase
        .from('events')
        .select('id')
        .eq('project_id', projectId)
        .eq('is_project_activity', true);

      if (actError) {
        console.error('Error fetching activities:', actError);
        throw actError;
      }

      const totalActivities = activities?.length || 0;
      console.log('Total activities:', totalActivities);

      // 3. Calculate stats for each registrant
      return registrations.map((reg: any): RegistrantStats => {
        const attendedActivities = reg.attendance_records?.filter(
          (record: any) => record.status === 'present'
        ).length || 0;

        return {
          name: reg.name,
          attendedActivities,
          totalActivities,
          attendancePercentage: totalActivities > 0 
            ? (attendedActivities / totalActivities) * 100 
            : 0
        };
      });
    },
    enabled: !!projectId
  });

  return { registrantsStats, isLoading };
};