
import { FormEvent } from "react";
import { toast } from "sonner";
import { useRegistrationState } from "./useRegistrationState";
import { useRegistrationSubmit } from "./useRegistrationSubmit";
import { RegistrationFormData } from "../types/registration";

export const useRegistration = (
  onSuccess: (registrationId: string) => void,
  isProject: boolean = false
) => {
  const {
    formData,
    setFormData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    setRegistrationId,
    isSubmitting,
    setIsSubmitting,
    isRegistered,
    setIsRegistered,
  } = useRegistrationState();

  const { handleSubmit: submitRegistration } = useRegistrationSubmit({
    eventTitle: "",
    eventPrice: null,
    onSubmit: () => {
      console.log('Registration submission completed');
      // لا نقوم باستدعاء onSuccess هنا لأننا نريد التحكم في توقيت إغلاق النافذة
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('useRegistration - Form submitted with data:', formData);
    
    try {
      setIsSubmitting(true);
      const result = await submitRegistration(e, formData, setIsSubmitting);
      
      if (result) {
        console.log('Registration successful, showing confirmation dialog');
        // Now we use the registration_number instead of the id
        setRegistrationId(result.registrationNumber);
        setShowConfirmation(true);
        setIsRegistered(true);
        
        console.log('Registration successful:', {
          registrationId: result.registrationNumber,
          formData
        });
      }
    } catch (error) {
      console.error('useRegistration - Error in registration:', error);
      toast.error('حدث خطأ في التسجيل، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isSubmitting,
    isRegistered,
    handleSubmit
  };
};
