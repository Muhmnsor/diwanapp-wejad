import { useState } from "react";
import { RegistrationFormData } from "../types/registration";

export const useRegistrationState = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: "",
    arabicName: "",
    englishName: "",
    email: "",
    phone: "",
    educationLevel: "",
    birthDate: null,
    nationalId: "",
    gender: "",
    workStatus: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
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