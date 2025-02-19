
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
        // تعيين معرف التسجيل أولاً
        setRegistrationId(result.registrationNumber);
        setIsRegistered(true);
        
        // إظهار نافذة التأكيد أولاً
        setShowConfirmation(true);
        
        console.log('Showing confirmation dialog for registration:', {
          registrationId: result.registrationNumber,
          formData
        });
        
        // إغلاق نافذة التسجيل بعد التأكد من ظهور نافذة التأكيد
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(result.registrationNumber);
          }
        }, 500);
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
