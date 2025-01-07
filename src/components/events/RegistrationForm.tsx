import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { FormField } from "./form/fields/FormField";
import { TextInputField } from "./form/fields/TextInputField";
import { SelectField } from "./form/fields/SelectField";
import { PaymentFields } from "./form/PaymentFields";
import { useFormValidation } from "./registration/validation/useFormValidation";
import { useRegistrationSubmit } from "./registration/hooks/useRegistrationSubmit";

export const RegistrationForm = ({ 
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit 
}: {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  onSubmit: () => void;
}) => {
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
    cvv: ""
  });
  
  const [registrationFields, setRegistrationFields] = useState({
    arabic_name: true,
    email: true,
    phone: true,
    english_name: false,
    education_level: false,
    birth_date: false,
    national_id: false,
    gender: false,
    work_status: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errors, validateForm } = useFormValidation(registrationFields, eventPrice);
  const { handleSubmit: submitRegistration } = useRegistrationSubmit({
    eventTitle,
    eventPrice,
    eventDate,
    eventTime,
    eventLocation,
    onSubmit
  });

  // Get event ID from URL
  const eventId = window.location.pathname.split('/').pop();

  useEffect(() => {
    const fetchRegistrationFields = async () => {
      if (!eventId) return;

      try {
        const { data, error } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .single();

        if (error) throw error;

        if (data) {
          console.log('📋 Fetched registration fields:', data);
          setRegistrationFields(data);
        }
      } catch (error) {
        console.error('Error fetching registration fields:', error);
      }
    };

    fetchRegistrationFields();
  }, [eventId]);

  const handleFormSubmit = async (e: FormEvent) => {
    if (!validateForm(formData)) return;
    await submitRegistration(e, formData, setIsSubmitting);
  };

  // Check if event is paid
  const isPaidEvent = eventPrice && eventPrice !== "free" && typeof eventPrice === "number";

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      {registrationFields.arabic_name && (
        <FormField label="الاسم الثلاثي بالعربية" required>
          <TextInputField
            value={formData.arabicName}
            onChange={(value) => setFormData({ ...formData, arabicName: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.english_name && (
        <FormField label="الاسم الثلاثي بالإنجليزية">
          <TextInputField
            value={formData.englishName}
            onChange={(value) => setFormData({ ...formData, englishName: value })}
          />
        </FormField>
      )}

      {registrationFields.email && (
        <FormField label="البريد الإلكتروني" required>
          <TextInputField
            type="email"
            value={formData.email}
            onChange={(value) => setFormData({ ...formData, email: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.phone && (
        <FormField label="رقم الجوال" required>
          <TextInputField
            type="tel"
            value={formData.phone}
            onChange={(value) => setFormData({ ...formData, phone: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.education_level && (
        <FormField label="المستوى التعليمي">
          <SelectField
            value={formData.educationLevel}
            onChange={(value) => setFormData({ ...formData, educationLevel: value })}
            options={[
              { value: "primary", label: "ابتدائي" },
              { value: "intermediate", label: "متوسط" },
              { value: "high_school", label: "ثانوي" },
              { value: "bachelor", label: "بكالوريوس" },
              { value: "master", label: "ماجستير" },
              { value: "phd", label: "دكتوراه" }
            ]}
          />
        </FormField>
      )}

      {registrationFields.birth_date && (
        <FormField label="تاريخ الميلاد">
          <TextInputField
            type="date"
            value={formData.birthDate}
            onChange={(value) => setFormData({ ...formData, birthDate: value })}
          />
        </FormField>
      )}

      {registrationFields.national_id && (
        <FormField label="رقم الهوية">
          <TextInputField
            value={formData.nationalId}
            onChange={(value) => setFormData({ ...formData, nationalId: value })}
          />
        </FormField>
      )}

      {registrationFields.gender && (
        <FormField label="الجنس">
          <SelectField
            value={formData.gender}
            onChange={(value) => setFormData({ ...formData, gender: value })}
            options={[
              { value: "male", label: "ذكر" },
              { value: "female", label: "أنثى" }
            ]}
          />
        </FormField>
      )}

      {registrationFields.work_status && (
        <FormField label="الحالة الوظيفية">
          <SelectField
            value={formData.workStatus}
            onChange={(value) => setFormData({ ...formData, workStatus: value })}
            options={[
              { value: "employed", label: "موظف" },
              { value: "unemployed", label: "غير موظف" },
              { value: "student", label: "طالب" },
              { value: "retired", label: "متقاعد" }
            ]}
          />
        </FormField>
      )}

      {isPaidEvent && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
        />
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'جاري التسجيل...' : isPaidEvent ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : 'تأكيد التسجيل'}
      </button>
    </form>
  );
};