import { useState } from "react";
import { validateRegistrationData } from "../validation/registrationValidation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useRegistrationState = (onSubmit: () => void) => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    arabicName: "",
    englishName: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, eventPrice: number | "free" | null) => {
    e.preventDefault();
    console.log("Starting registration process...");
    
    const validationErrors = validateRegistrationData(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error("يرجى تصحيح الأخطاء في النموذج");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const { data: registrationData, error: registrationError } = await supabase
        .from('registrations')
        .insert({
          ...formData,
          eventPrice,
        })
        .select()
        .single();

      if (registrationError) throw registrationError;

      toast.success("تم التسجيل بنجاح");
      onSubmit();
    } catch (error) {
      console.error('Error in registration process:', error);
      toast.error("حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    handleSubmit
  };
};
