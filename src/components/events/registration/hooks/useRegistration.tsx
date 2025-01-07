import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RegistrationFormData, UseRegistrationProps, UseRegistrationReturn } from '../types/registration';

export const useRegistration = (
  onSuccess?: () => void,
  isProject: boolean = false
): UseRegistrationReturn => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
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
    console.log('Submitting registration:', data);
    setIsSubmitting(true);

    try {
      const registrationNumber = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      const { error } = await supabase
        .from('registrations')
        .insert([
          {
            ...data,
            registration_number: registrationNumber,
            project_id: isProject ? window.location.pathname.split('/').pop() : null,
            event_id: !isProject ? window.location.pathname.split('/').pop() : null
          }
        ]);

      if (error) throw error;

      setRegistrationNumber(registrationNumber);
      setIsRegistered(true);
      toast.success('تم التسجيل بنجاح');
      onSuccess?.();
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitRegistration(formData);
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    registrationNumber,
    isRegistered,
    handleSubmit,
    submitRegistration
  };
};