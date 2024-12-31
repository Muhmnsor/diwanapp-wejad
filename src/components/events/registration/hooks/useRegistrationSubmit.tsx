import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface UseRegistrationSubmitProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  setIsSubmitting: (value: boolean) => void;
  setRegistrationId: (value: string) => void;
  setIsRegistered: (value: boolean) => void;
  setShowConfirmation: (value: boolean) => void;
  isProject: boolean;
}

export const useRegistrationSubmit = ({
  formData,
  setIsSubmitting,
  setRegistrationId,
  setIsRegistered,
  setShowConfirmation,
  isProject,
}: UseRegistrationSubmitProps) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Starting registration submission...');
    
    setIsSubmitting(true);
    
    try {
      const registrationId = uuidv4();
      const registrationNumber = `REG-${registrationId.split('-')[0]}`;

      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            id: registrationId,
            arabic_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            registration_number: registrationNumber,
          }
        ]);

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Registration successful:', registrationId);
      setRegistrationId(registrationId);
      setIsRegistered(true);
      setShowConfirmation(true);
      
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};