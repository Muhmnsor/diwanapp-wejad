import { useRegistrationState } from "./useRegistrationState";
import { useRegistrationSubmit } from "./useRegistrationSubmit";

export const useRegistration = (
  onSubmit: (e: React.FormEvent) => void,
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

  const { handleSubmit } = useRegistrationSubmit({
    formData,
    setIsSubmitting,
    setRegistrationId,
    setIsRegistered,
    setShowConfirmation,
    isProject,
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    if (onSubmit) {
      onSubmit(e);
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