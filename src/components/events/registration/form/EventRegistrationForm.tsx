
import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EventRegistrationFields } from "../fields/EventRegistrationFields";
import { RegistrationFormActions } from "./RegistrationFormActions";
import { toast } from "sonner";

interface EventRegistrationFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isSubmitting: boolean;
  onSubmit: (e: FormEvent) => void;
  eventId: string;
  eventPrice: number | "free" | null;
  registrationFields: {
    arabic_name: boolean;
    email: boolean;
    phone: boolean;
    english_name: boolean;
    education_level: boolean;
    birth_date: boolean;
    national_id: boolean;
    gender: boolean;
    work_status: boolean;
  };
}

export const EventRegistrationForm = ({
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  eventId,
  eventPrice,
  registrationFields,
}: EventRegistrationFormProps) => {
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      // التحقق من آخر رقم تسجيل تم استخدامه
      const { data: lastRegistration, error: countError } = await supabase
        .from('registrations')
        .select('registration_number')
        .order('created_at', { ascending: false })
        .limit(1);

      if (countError) {
        console.error('Error getting last registration number:', countError);
        throw countError;
      }

      // إنشاء رقم تسجيل جديد
      let newRegNumber = 1;
      if (lastRegistration && lastRegistration.length > 0) {
        const lastNumber = parseInt(lastRegistration[0].registration_number.split('-')[1]);
        if (!isNaN(lastNumber)) {
          newRegNumber = lastNumber + 1;
        }
      }
      
      // تنسيق رقم التسجيل بشكل موحد (مثال: REG-001)
      const registrationNumber = `REG-${newRegNumber.toString().padStart(3, '0')}`;

      // Format birth date properly if it exists
      const birthDate = formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : null;

      // Prepare registration data
      const registrationData = {
        event_id: eventId,
        registration_number: registrationNumber,
        arabic_name: formData.arabicName,
        english_name: formData.englishName || null,
        email: formData.email,
        phone: formData.phone,
        education_level: formData.educationLevel || null,
        birth_date: birthDate,
        national_id: formData.nationalId || null,
        gender: formData.gender || null,
        work_status: formData.workStatus || null
      };

      console.log('Registration data being sent:', registrationData);

      // Insert registration data into the database
      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) {
        console.error('Error creating registration:', error);
        toast.error('حدث خطأ أثناء التسجيل');
        throw error;
      }

      console.log('Registration created successfully:', data);
      toast.success('تم التسجيل بنجاح');
      onSubmit(e);
    } catch (error) {
      console.error('Error in form submission:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    }
  };

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <EventRegistrationFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
      />
      
      <RegistrationFormActions
        isSubmitting={isSubmitting}
        isPaidEvent={isPaidEvent}
        eventPrice={eventPrice}
      />
    </form>
  );
};
