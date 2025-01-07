import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RegistrationFormData {
  arabicName: string;
  englishName?: string;
  email: string;
  phone: string;
  educationLevel?: string;
  birthDate?: string;
  nationalId?: string;
  gender?: string;
  workStatus?: string;
}

interface UseRegistrationSubmitProps {
  eventId: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const useRegistration = ({ eventId, onSuccess, onError }: UseRegistrationSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");

  const submitRegistration = async (formData: RegistrationFormData) => {
    console.log('Submitting registration:', { eventId, formData });
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            ...formData,
            registration_number: Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Registration successful:', data);
      setRegistrationNumber(data.registration_number);
      toast.success('تم التسجيل بنجاح');
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('حدث خطأ أثناء التسجيل');
      onError?.(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitRegistration,
    isSubmitting,
    registrationNumber
  };
};