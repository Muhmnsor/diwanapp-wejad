import { FormEvent } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRegistration } from "./registration/hooks/useRegistration";
import { PersonalInfoFields } from "./registration/form/fields/PersonalInfoFields";
import { OptionalFields } from "./registration/form/fields/OptionalFields";
import { PaymentFields } from "./registration/form/fields/PaymentFields";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const RegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: RegistrationFormProps) => {
  const { id } = useParams();
  const { formData, setFormData, isSubmitting, handleSubmit: submitRegistration } = useRegistration(() => {
    if (onSubmit) {
      onSubmit();
    }
  }, false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);

    try {
      const { data: registrationFields } = await supabase
        .from('event_registration_fields')
        .select('*')
        .eq('event_id', id)
        .single();

      if (!registrationFields) {
        console.error('No registration fields found');
        toast.error('حدث خطأ في التسجيل');
        return;
      }

      await submitRegistration(e);
      
      if (onSubmit) {
        onSubmit();
      }
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('حدث خطأ أثناء التسجيل');
    }
  };

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && typeof eventPrice === "number";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={{
          arabic_name: true,
          email: true,
          phone: true
        }}
      />

      <OptionalFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={{
          english_name: false,
          education_level: false,
          birth_date: false,
          national_id: false,
          gender: false,
          work_status: false
        }}
      />

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
        onClick={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        {isSubmitting ? 'جاري التسجيل...' : isPaidEvent ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : 'تأكيد التسجيل'}
      </button>
    </form>
  );
};