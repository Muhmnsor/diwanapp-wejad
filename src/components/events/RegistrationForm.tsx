import { FormEvent, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { FormField } from "./form/fields/FormField";
import { TextInputField } from "./form/fields/TextInputField";
import { SelectField } from "./form/fields/SelectField";

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
    workStatus: ""
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
  const { sendNotification } = useNotifications();

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Submitting registration form:', formData);
    
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
      return;
    }

    setIsSubmitting(true);

    try {
      // Get registration template
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .single();

      if (!template) {
        throw new Error('Registration template not found');
      }

      // Create registration with all fields
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert([{
          event_id: eventId,
          arabic_name: formData.arabicName,
          english_name: formData.englishName,
          email: formData.email,
          phone: formData.phone,
          education_level: formData.educationLevel,
          birth_date: formData.birthDate,
          national_id: formData.nationalId,
          gender: formData.gender,
          work_status: formData.workStatus,
          registration_number: `REG-${Date.now()}`
        }])
        .select()
        .single();

      if (registrationError) throw registrationError;

      // Send registration notification
      await sendNotification({
        type: 'registration',
        eventId,
        registrationId: registration.id,
        recipientPhone: formData.phone,
        templateId: template.id,
        variables: {
          name: formData.arabicName,
          event_title: eventTitle,
          event_date: eventDate || '',
          event_time: eventTime || '',
          event_location: eventLocation || '',
        }
      });

      toast.success('تم التسجيل بنجاح');
      onSubmit();
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {registrationFields.arabic_name && (
        <FormField label="الاسم الثلاثي" required>
          <TextInputField
            value={formData.arabicName}
            onChange={(value) => setFormData({ ...formData, arabicName: value })}
            required
          />
        </FormField>
      )}

      {registrationFields.english_name && (
        <FormField label="الاسم باللغة الإنجليزية">
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-white p-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'جاري التسجيل...' : 'تسجيل'}
      </button>
    </form>
  );
};
