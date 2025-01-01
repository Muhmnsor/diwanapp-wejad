import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRegistrationFields = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['project-registration-fields', projectId],
    queryFn: async () => {
      console.log('Fetching project registration fields for:', projectId);
      if (!projectId) {
        throw new Error('Project ID is required');
      }

      // Delete any duplicate records first
      const { data: duplicates, error: deleteError } = await supabase
        .from('project_registration_fields')
        .delete()
        .eq('project_id', projectId)
        .neq('id', (
          await supabase
            .from('project_registration_fields')
            .select('id')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
        ).data.id)
        .select();

      if (deleteError) {
        console.error('Error deleting duplicate fields:', deleteError);
      } else if (duplicates && duplicates.length > 0) {
        console.log('Deleted duplicate registration fields:', duplicates);
      }

      // Now fetch the single record
      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project registration fields:', error);
        throw error;
      }

      // If no fields are found, return default values
      if (!data) {
        console.log('No project registration fields found, using defaults');
        return {
          arabic_name: true,
          email: true,
          phone: true,
          english_name: false,
          education_level: false,
          birth_date: false,
          national_id: false,
          gender: false,
          work_status: false
        };
      }

      console.log('Fetched project registration fields:', data);
      return data;
    },
    retry: 1
  });
};