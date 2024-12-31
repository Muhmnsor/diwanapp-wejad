import { useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useConfirmationValidation = (
  registrationId: string,
  formData: {
    name: string;
    email: string;
    phone: string;
  }
) => {
  const { data: registrationFields } = useQuery({
    queryKey: ['project-registration-fields', registrationId],
    queryFn: async () => {
      console.log('Fetching project registration fields for:', registrationId);
      const { data, error } = await supabase
        .from('project_registration_fields')
        .select('*')
        .eq('project_id', registrationId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching project registration fields:', error);
        return null;
      }

      console.log('Fetched project registration fields:', data);
      return data || {
        arabic_name: true,
        email: true,
        phone: true
      };
    }
  });

  const validateRequiredFields = () => {
    if (!registrationFields) return false;

    const requiredValidations = {
      name: !registrationFields.arabic_name || (registrationFields.arabic_name && formData.name),
      email: !registrationFields.email || (registrationFields.email && formData.email),
      phone: !registrationFields.phone || (registrationFields.phone && formData.phone)
    };

    return Object.values(requiredValidations).every(isValid => isValid);
  };

  return {
    registrationFields,
    validateRequiredFields
  };
};