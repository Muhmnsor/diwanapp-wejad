import { FormEvent } from "react";
import { useRegistrationState } from "./useRegistrationState";
import { useRegistrationSubmit } from "./useRegistrationSubmit";
import { toast } from "sonner";

export const useRegistration = (
  onSubmit: () => void,
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
    formData,
    setIsSubmitting,
    setRegistrationId,
    setIsRegistered,
    setShowConfirmation,
    isProject,
  });

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    try {
      await submitRegistration(e);
      toast.success('تم التسجيل بنجاح');
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('حدث خطأ في التسجيل، يرجى المحاولة مرة أخرى');
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
    handleSubmit: handleFormSubmit
  };
};