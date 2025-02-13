
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Registration } from "../types";

export const useDashboardData = (eventId: string) => {
  // Fetch event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event details for dashboard:', eventId);
      
      // First try to fetch from events table
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (!eventError && eventData) {
        console.log('Found event:', eventData);
        return {
          ...eventData,
          start_date: eventData.date,
          end_date: eventData.end_date || eventData.date
        };
      }

      // If not found, try projects table
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', eventId)
        .maybeSingle();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        throw projectError;
      }

      console.log('Found project:', projectData);
      return projectData;
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
      event,
      registrations
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
