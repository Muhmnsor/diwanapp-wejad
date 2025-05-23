import { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EventRegistrationFields } from "./fields/EventRegistrationFields";
import { EventRegistrationButton } from "./components/EventRegistrationButton";
import { LoadingState, ErrorState } from "./components/RegistrationFormStates";
import { useRegistration } from "./hooks/useRegistration";

interface EventRegistrationFormProps {
  eventId: string;
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: (e: FormEvent) => void;
}

export const EventRegistrationForm = ({
  eventId,
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
}: EventRegistrationFormProps) => {
  const { formData, setFormData, isSubmitting } = useRegistration(() => {}, false);

  const { data: registrationFields, isLoading, error } = useQuery({
    queryKey: ['event-registration-fields', eventId],
    queryFn: async () => {
      console.log('Fetching event registration fields for:', eventId);
      try {
        const { data: eventFields, error: eventFieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', eventId)
          .maybeSingle();

        if (eventFieldsError) {
          console.error('Error fetching event registration fields:', eventFieldsError);
          throw eventFieldsError;
        }

        if (!eventFields) {
          console.log('No registration fields found, using defaults');
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

        console.log('Retrieved registration fields:', eventFields);
        return eventFields;
      } catch (error) {
        console.error('Failed to fetch event registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000
  });

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  return (
    <form onSubmit={onSubmit} className="space-y-4 mt-4">
      <EventRegistrationFields
        registrationFields={registrationFields}
        eventPrice={eventPrice}
        showPaymentFields={isPaidEvent}
        formData={formData}
        setFormData={setFormData}
      />
      <EventRegistrationButton
        isPaidEvent={isPaidEvent}
        eventPrice={eventPrice}
        isSubmitting={isSubmitting}
      />
    </form>
  );
};