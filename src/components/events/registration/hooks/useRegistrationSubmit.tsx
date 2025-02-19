
import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { RegistrationFormData } from "../types/registration";

interface UseRegistrationSubmitProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  onSubmit: () => void;
}

export const useRegistrationSubmit = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: UseRegistrationSubmitProps) => {
  const { sendNotification } = useNotifications();
  const eventId = window.location.pathname.split('/').pop();

  const handleSubmit = async (
    e: FormEvent,
    formData: RegistrationFormData,
    setIsSubmitting: (value: boolean) => void
  ) => {
    e.preventDefault();
    console.log('Submitting registration form:', formData);
    
    setIsSubmitting(true);

    try {
      // Format birth date properly if it exists
      const birthDate = formData.birthDate ? new Date(formData.birthDate).toISOString().split('T')[0] : null;

      // Prepare registration data
      const registrationData = {
        event_id: eventId,
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

      // Insert registration record
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select('*')
        .single();

      if (registrationError) {
        console.error('Error creating registration:', registrationError);
        throw registrationError;
      }

      console.log('Registration created successfully:', registration);

      // Handle payment if it's a paid event
      if (eventPrice && eventPrice !== "free" && typeof eventPrice === "number") {
        const { error: paymentError } = await supabase
          .from('payment_transactions')
          .insert([{
            registration_id: registration.id,
            amount: eventPrice,
            status: 'pending',
            payment_method: 'card'
          }]);

        if (paymentError) {
          console.error('Error creating payment transaction:', paymentError);
          throw paymentError;
        }
      }

      // Get default registration template
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .maybeSingle();

      // Send WhatsApp notification if template exists
      if (template) {
        try {
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
        } catch (notificationError) {
          console.error('Error sending notification:', notificationError);
          // Continue with registration even if notification fails
        }
      }

      toast.success('تم التسجيل بنجاح');
      
      setTimeout(() => {
        onSubmit();
      }, 500);

      return registration.id;
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error('حدث خطأ أثناء التسجيل');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};
