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
    console.log('useRegistration - Form submitted with data:', formData);
    
    try {
      const newRegistrationId = await submitRegistration(e);
      console.log('useRegistration - Registration successful, ID:', newRegistrationId);
      
      // تحديث الحالات بعد نجاح التسجيل
      setShowConfirmation(true);
      setIsRegistered(true);
      setRegistrationId(newRegistrationId);
      
      console.log('States updated after successful registration:', {
        registrationId: newRegistrationId,
        isRegistered: true,
        showConfirmation: true
      });
      
      toast.success('تم التسجيل بنجاح');
      
      if (onSubmit) {
        console.log('useRegistration - Calling onSubmit callback');
        onSubmit();
      }
    } catch (error) {
      console.error('useRegistration - Error in registration:', error);
      toast.error('حدث خطأ في التسجيل، يرجى المحاولة مرة أخرى');
      // إعادة تعيين الحالات في حالة الخطأ
      setShowConfirmation(false);
      setIsRegistered(false);
      setRegistrationId('');
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