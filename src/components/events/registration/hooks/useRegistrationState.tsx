import { useState } from "react";

export const useRegistrationState = () => {
  const [formData, setFormData] = useState({
    arabicName: "",
    englishName: "",
    email: "",
    phone: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
    gender: "",
    workStatus: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  return {
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
  };
};