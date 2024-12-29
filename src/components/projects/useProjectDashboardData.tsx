import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useProjectDashboardData = (projectId: string) => {
  // Fetch project details
  const { data: project, isLoading: projectLoading, error: projectError } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      console.log('Fetching project details for dashboard:', projectId);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('Error fetching project:', error);
        throw error;
      }

      console.log('Project data fetched:', data);
      return data;
    },
  });

  // Fetch registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['project-registrations', projectId],
    queryFn: async () => {
      console.log('Fetching registrations for project:', projectId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Registrations data fetched:', data);
      return data;
    },
    enabled: !!projectId,
  });

  const calculateDashboardData = () => {
    if (!project) return null;

    const registrationCount = registrations?.length || 0;
    const remainingSeats = project.max_attendees - registrationCount;
    const occupancyRate = (registrationCount / project.max_attendees) * 100;

    console.log('Dashboard data calculated:', {
      registrationCount,
      remainingSeats,
      occupancyRate,
      projectDate: project.start_date,
      registrations: registrations
    });

    return {
      registrationCount,
      remainingSeats,
      occupancyRate,
      project,
      registrations
    };
  };

  return {
    isLoading: projectLoading || registrationsLoading,
    error: projectError,
    data: calculateDashboardData()
  };
};