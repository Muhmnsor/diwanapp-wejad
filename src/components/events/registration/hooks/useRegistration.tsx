
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
      // لا نحتاج إلى استدعاء onSuccess هنا بعد الآن
    }
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('useRegistration - Form submitted with data:', formData);
    
    try {
      setIsSubmitting(true);
      const result = await submitRegistration(e, formData, setIsSubmitting);
      
      if (result) {
        console.log('Registration successful:', result);
        setRegistrationId(result.registrationNumber);
        setIsRegistered(true);
        
        // استدعاء onSuccess قبل إظهار التأكيد مباشرة
        if (onSuccess) {
          onSuccess(result.registrationNumber);
        }
        
        // تأخير قصير قبل إظهار التأكيد للسماح بإغلاق نافذة التسجيل
        setTimeout(() => {
          setShowConfirmation(true);
        }, 100);
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
