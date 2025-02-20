
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRegistrationsQuery = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.error('No ID provided');
        return [];
      }

      try {
        // First, check if this is a project
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', eventId)
          .maybeSingle();

        if (projectError) {
          console.error('Error checking project:', projectError);
          throw projectError;
        }

        console.log('Checking if ID is a project:', projectData);
        const isProject = !!projectData;
        console.log('Is this a project?', isProject);

        // Query registrations based on whether this is a project or event
        const { data: registrationsData, error: registrationsError } = await supabase
          .from('registrations')
          .select(`
            *,
            event:events(*),
            project:projects(*)
          `)
          .eq(isProject ? 'project_id' : 'event_id', eventId)
          .order('created_at', { ascending: false }); // Changed to descending order

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
          throw registrationsError;
        }

        console.log('Fetched registrations:', registrationsData);
        // Reverse the array to get oldest first
        return (registrationsData || []).reverse();
      } catch (err) {
        console.error('Error in registration query:', err);
        throw err;
      }
    },
    enabled: !!eventId,
    retry: 1
  });
};
