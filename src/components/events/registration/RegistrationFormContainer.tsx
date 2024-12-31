import { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationFormInputs } from "../RegistrationFormInputs";
import { Button } from "@/components/ui/button";
import { useRegistration } from "./hooks/useRegistration";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
  isProject?: boolean;
}

export const RegistrationFormContainer = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: RegistrationFormContainerProps) => {
  const { id } = useParams();
  const {
    formData,
    setFormData,
    isSubmitting,
    handleSubmit
  } = useRegistration(() => {
    if (onSubmit) {
      const syntheticEvent = { preventDefault: () => {} } as FormEvent;
      onSubmit(syntheticEvent);
    }
  }, isProject);

  const { data: registrationFields } = useQuery({
    queryKey: ['registration-fields', id],
    queryFn: async () => {
      console.log('Fetching registration fields for:', id);
      const { data: eventFields, error } = await supabase
        .from('event_registration_fields')
        .select('*')
        .eq('event_id', id)
        .single();

      if (error) {
        console.error('Error fetching registration fields:', error);
        throw error;
      }

      console.log('Fetched registration fields:', eventFields);
      
      if (!eventFields) {
        return {
          arabic_name: true,
          email: true,
          phone: true,
          english_name: false,
          education_level: false,
          birth_date: false,
          national_id: false,
          gender: false,
          work_status: false
        };
      }

      return eventFields;
    },
  });

  if (!registrationFields) {
    return null;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;
  const buttonText = isSubmitting ? "جاري المعالجة..." : isPaidEvent ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : "تأكيد التسجيل";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <RegistrationFormInputs
        formData={formData}
        setFormData={setFormData}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        registrationFields={registrationFields}
      />
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {buttonText}
      </Button>
    </form>
  );
};