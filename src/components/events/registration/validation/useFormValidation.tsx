import { useState } from "react";
import { toast } from "sonner";
import { RegistrationFormData } from "../types/registration";

export const useFormValidation = (registrationFields: Record<string, boolean>, eventPrice: number | "free" | null) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (formData: RegistrationFormData) => {
    const newErrors: Record<string, string> = {};
    
    // Validate required fields based on registration settings
    const requiredFields = Object.entries(registrationFields)
      .filter(([_, isRequired]) => isRequired)
      .map(([field]) => field.toLowerCase());

    const missingFields = requiredFields.filter(field => {
      const formField = field.replace(/_/g, '');
      return !formData[formField as keyof typeof formData];
    });

    if (missingFields.length > 0) {
      toast.error('يرجى تعبئة جميع الحقول المطلوبة');
      return false;
    }

    // Additional validation for payment fields if event is paid
    if (eventPrice && eventPrice !== "free" && typeof eventPrice === "number") {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
        toast.error('يرجى إدخال معلومات الدفع');
        return false;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateForm };
};