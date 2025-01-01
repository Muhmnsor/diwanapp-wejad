import { FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationFormInputs } from "@/components/events/RegistrationFormInputs";
import { Button } from "@/components/ui/button";
import { useRegistration } from "./hooks/useRegistration";
import { toast } from "sonner";

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
      const syntheticEvent = { preventDefault: () => {} } as FormEvent<Element>;
      onSubmit(syntheticEvent);
    }
  }, isProject);

  const handleFormDataChange = (newData: any) => {
    console.log('Form data changed:', newData);
    setFormData({
      ...newData,
      name: newData.arabicName
    });
  };

  const { data: registrationFields, isLoading, error } = useQuery({
    queryKey: ['registration-fields', id],
    queryFn: async () => {
      console.log('Fetching registration fields for:', id);
      try {
        const { data: eventFields, error: eventFieldsError } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', id)
          .maybeSingle();

        if (eventFieldsError) {
          console.error('Error fetching registration fields:', eventFieldsError);
          throw eventFieldsError;
        }

        console.log('Raw registration fields from database:', eventFields);
        
        // If no specific fields are set for this event, use default required fields
        const fields = eventFields || {
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

        console.log('Processed registration fields:', fields);

        // Return the fields with explicit boolean values
        return {
          arabic_name: Boolean(fields.arabic_name),
          email: Boolean(fields.email),
          phone: Boolean(fields.phone),
          english_name: Boolean(fields.english_name),
          education_level: Boolean(fields.education_level),
          birth_date: Boolean(fields.birth_date),
          national_id: Boolean(fields.national_id),
          gender: Boolean(fields.gender),
          work_status: Boolean(fields.work_status)
        };
      } catch (error) {
        console.error('Failed to fetch registration fields:', error);
        toast.error('حدث خطأ في تحميل نموذج التسجيل');
        throw error;
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 1000 * 60 * 5 // Cache for 5 minutes
  });

  if (isLoading) {
    return <div className="text-center py-4">جاري تحميل نموذج التسجيل...</div>;
  }

  if (error) {
    console.error('Error in registration form:', error);
    return (
      <div className="text-center py-4 text-red-500">
        حدث خطأ في تحميل نموذج التسجيل. يرجى المحاولة مرة أخرى.
      </div>
    );
  }

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;
  const buttonText = isSubmitting ? "جاري المعالجة..." : isPaidEvent ? `الدفع وتأكيد التسجيل (${eventPrice} ريال)` : "تأكيد التسجيل";

  console.log('Registration fields being passed to form:', registrationFields);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <RegistrationFormInputs
        formData={formData}
        setFormData={handleFormDataChange}
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