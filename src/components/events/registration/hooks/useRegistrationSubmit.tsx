import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { RegistrationFormData } from "../types/registration";

interface UseRegistrationSubmitProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  onSubmit: () => void;
}

export const useRegistrationSubmit = ({
  eventTitle,
  eventPrice,
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
      // Get registration template
      const { data: template } = await supabase
        .from('whatsapp_templates')
        .select('id')
        .eq('notification_type', 'event_registration')
        .eq('is_default', true)
        .maybeSingle();

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

      // If event is paid, create payment transaction
      if (eventPrice && eventPrice !== "free" && typeof eventPrice === "number") {
        const { error: paymentError } = await supabase
          .from('payment_transactions')
          .insert([{
            registration_id: registration.id,
            amount: eventPrice,
            status: 'pending',
            payment_method: 'card'
          }]);

        if (paymentError) throw paymentError;
      }

      // Send registration notification
      if (template) {
        await sendNotification({
          type: 'registration',
          eventId,
          registrationId: registration.id,
          recipientPhone: formData.phone,
          templateId: template.id,
          variables: {
            name: formData.arabicName,
            event_title: eventTitle,
          }
        });
      }

      toast.success('تم التسجيل بنجاح');
      onSubmit();
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