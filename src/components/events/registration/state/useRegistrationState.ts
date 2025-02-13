
import { useState } from "react";
import { validateRegistrationData } from "../validation/registrationValidation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationData {
  email: string;
  phone: string;
  arabicName: string;
  englishName?: string;
  educationLevel?: string;
  birthDate?: string | null;
  nationalId?: string;
  gender?: string;
  workStatus?: string;
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
}

export const useRegistrationState = (onSubmit: () => void) => {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    phone: "",
    arabicName: "",
    englishName: "",
    educationLevel: "",
    birthDate: null,
    nationalId: "",
    gender: "",
    workStatus: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent, eventId: string) => {
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
      const registrationNumber = `REG-${Date.now()}`;
      const registrationData = {
        event_id: eventId,
        email: formData.email,
        phone: formData.phone,
        arabic_name: formData.arabicName,
        english_name: formData.englishName || null,
        education_level: formData.educationLevel || null,
        birth_date: formData.birthDate || null,
        national_id: formData.nationalId || null,
        gender: formData.gender || null,
        work_status: formData.workStatus || null,
        registration_number: registrationNumber
      };

      const { data: registrationResult, error: registrationError } = await supabase
        .from('registrations')
        .insert(registrationData)
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
