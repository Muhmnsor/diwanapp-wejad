import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Registration } from "../types";

export const useDashboardData = (eventId: string) => {
  // Fetch event details
  const { data: event, isLoading: eventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('Fetching event details for dashboard:', eventId);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) {
        console.error('Error fetching event:', error);
        throw error;
      }

      console.log('Event data fetched:', data);
      return data;
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