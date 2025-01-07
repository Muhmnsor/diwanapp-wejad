import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RegistrationFormData, UseRegistrationProps } from '../types/registration';

export const useRegistration = ({ eventId, onSuccess, onError }: UseRegistrationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [formData, setFormData] = useState<RegistrationFormData>({
    arabicName: "",
    email: "",
    phone: "",
    englishName: "",
    educationLevel: "",
    birthDate: null,
    nationalId: "",
    gender: "",
    workStatus: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const submitRegistration = async (data: RegistrationFormData) => {
    console.log('Submitting registration:', { eventId, data });
    setIsSubmitting(true);

    try {
      const { data: registration, error } = await supabase
        .from('registrations')
        .insert([
          {
            event_id: eventId,
            ...data,
            registration_number: Math.random().toString(36).substring(2, 8).toUpperCase()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('Registration successful:', registration);
      setRegistrationNumber(registration.registration_number);
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
    formData,
    setFormData,
    submitRegistration,
    isSubmitting,
    registrationNumber
  };
};