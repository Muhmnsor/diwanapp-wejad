import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useRegistrationsQuery = (eventId: string) => {
  return useQuery({
    queryKey: ['registrations', eventId],
    queryFn: async () => {
      if (!eventId) {
        console.error('No ID provided');
        return [];
      }

      try {
        console.log('Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw new Error('فشل في التحقق من جلسة المستخدم');
        }

        if (!session) {
          console.error('No active session');
          throw new Error('جلسة المستخدم غير نشطة');
        }

        // First, check if this is a project
        console.log('Checking if ID is a project:', eventId);
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id')
          .eq('id', eventId)
          .maybeSingle();

        if (projectError) {
          console.error('Error checking project:', projectError);
          throw projectError;
        }

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
          .eq(isProject ? 'project_id' : 'event_id', eventId);

        if (registrationsError) {
          console.error('Error fetching registrations:', registrationsError);
          throw registrationsError;
        }

        console.log('Fetched registrations:', registrationsData);
        return registrationsData || [];
      } catch (err) {
        console.error('Error in registration query:', err);
        toast.error('حدث خطأ في جلب التسجيلات');
        throw err;
      }
    },
    enabled: !!eventId,
    retry: 2,
    retryDelay: 1000
  });
};