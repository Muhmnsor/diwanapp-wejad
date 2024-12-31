import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useParams } from "react-router-dom";

interface UseRegistrationSubmitProps {
  formData: {
    arabicName: string;
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
  const { id } = useParams();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Starting registration submission...');
    console.log('Form data:', formData);
    console.log('Event/Project ID from URL:', id);
    
    setIsSubmitting(true);
    
    try {
      const registrationId = uuidv4();
      const registrationNumber = `REG-${registrationId.split('-')[0]}`;

      const registrationData = {
        id: registrationId,
        arabic_name: formData.arabicName, // تم تصحيح اسم الحقل هنا
        email: formData.email,
        phone: formData.phone,
        registration_number: registrationNumber,
      };

      // Add either event_id or project_id based on the registration type
      if (isProject) {
        Object.assign(registrationData, { project_id: id });
      } else {
        Object.assign(registrationData, { event_id: id });
      }

      console.log('Submitting registration with data:', registrationData);

      const { error } = await supabase
        .from('registrations')
        .insert([registrationData]);

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