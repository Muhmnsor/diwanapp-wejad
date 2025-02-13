import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Registration } from "../types";

export const useDashboardData = (eventId: string) => {
  // Fetch event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event details for dashboard:', eventId);
      
      // First try to fetch from portfolio_only_projects
      const { data: portfolioProject, error: portfolioError } = await supabase
        .from('portfolio_only_projects')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (!portfolioError && portfolioProject) {
        console.log('Found portfolio project:', portfolioProject);
        return {
          ...portfolioProject,
          start_date: portfolioProject.start_date,
          end_date: portfolioProject.due_date,
          max_attendees: 0 // Portfolio projects don't have attendees
        };
      }

      // If not found, try regular projects
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        throw projectError;
      }

      console.log('Found regular project:', project);
      return project;
    },
  });

  // Fetch registrations
  const { data: registrations = [], isLoading: registrationsLoading } = useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      console.log('Fetching registrations for event:', eventId);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error fetching registrations:', error);
        throw error;
      }

      console.log('Registrations data fetched:', data);
      return data as Registration[];
    },
    enabled: !!eventId,
  });

  const calculateDashboardData = () => {
    if (!event) return null;

    const registrationCount = registrations?.length || 0;
    const remainingSeats = event.max_attendees - registrationCount;
    const occupancyRate = (registrationCount / event.max_attendees) * 100;

    console.log('Dashboard data calculated:', {
      registrationCount,
      remainingSeats,
      occupancyRate,
      eventDate: event.date,
      eventTime: event.time,
      registrations: registrations
    });

    return {
      registrationCount,
      remainingSeats,
      occupancyRate,
      event,
      registrations
    };
  };

  return {
    isLoading: eventLoading || registrationsLoading,
    error: eventError,
    data: calculateDashboardData()
  };
};