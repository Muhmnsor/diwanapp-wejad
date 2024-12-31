import { FormEvent } from "react";
import { useRegistrationState } from "./useRegistrationState";
import { useRegistrationSubmit } from "./useRegistrationSubmit";

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
    
    await submitRegistration(e);
    if (onSubmit) {
      onSubmit();
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