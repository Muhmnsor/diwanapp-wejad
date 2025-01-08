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

      // First, check if registration fields exist
      const { data: existingFields, error: checkError } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking project registration fields:', checkError);
        throw checkError;
      }

      // If no fields exist, create default ones
      if (!existingFields) {
        console.log('No registration fields found, creating defaults for project:', projectId);
        const defaultFields = {
          project_id: projectId,
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

        const { data: newFields, error: insertError } = await supabase
          .from('project_registration_fields')
          .insert(defaultFields)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default registration fields:', insertError);
          return defaultFields; // Return defaults even if insert fails
        }

        console.log('Created default registration fields:', newFields);
        return newFields;
      }

      console.log('Found existing registration fields:', existingFields);
      return existingFields;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
};