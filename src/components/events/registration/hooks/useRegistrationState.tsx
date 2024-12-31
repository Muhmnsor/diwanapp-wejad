import { useState } from "react";

export interface RegistrationFormData {
  arabicName: string;
  englishName: string;
  email: string;
  phone: string;
  educationLevel: string;
  birthDate: string;
  nationalId: string;
  gender: string;
  workStatus: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export const useRegistrationState = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
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