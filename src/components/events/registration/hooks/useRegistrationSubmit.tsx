
import { FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNotifications } from "@/hooks/useNotifications";
import { useEventNotifications } from "@/hooks/useEventNotifications";
import { RegistrationFormData } from "../types/registration";
import { useAuthStore } from "@/store/authStore";

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
  const { sendRegistrationNotification } = useEventNotifications();
  const { user } = useAuthStore();
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
      // Check if max attendees limit has been reached
      if (eventId) {
        const { data: eventData, error: eventError } = await supabase
          .from('events')
          .select('max_attendees, attendees')
          .eq('id', eventId)
          .single();
          
        if (eventError) {
          console.error('Error fetching event details:', eventError);
          throw new Error('حدث خطأ أثناء التحقق من توفر الأماكن');
        }
        
        if (eventData && eventData.max_attendees > 0 && eventData.attendees >= eventData.max_attendees) {
          throw new Error('عذراً، لقد اكتمل العدد في هذه الفعالية');
        }
      }

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
        work_status: formData.workStatus || null,
        user_id: user?.id || null // Add user_id if the user is logged in
      };

      console.log('Registration data being sent:', registrationData);

      // Insert registration record and get both id and registration_number
      const { data: registration, error: registrationError } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select('id, registration_number')
        .single();

      if (registrationError) {
        console.error('Error creating registration:', registrationError);
        throw registrationError;
      }

      console.log('Registration created successfully:', registration);

      // Update event attendees count
      if (eventId) {
        const { error: updateError } = await supabase
          .rpc('increment_event_attendees', { 
            event_id: eventId 
          })
          .single();
          
        if (updateError) {
          console.warn('Error updating attendees count:', updateError);
          // Non-critical error, don't throw
        }
      }

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

      // Send notifications (both in-app and WhatsApp)
      await sendRegistrationNotification({
        eventId: eventId || '',
        eventTitle,
        eventDate,
        eventTime,
        eventLocation,
        recipientName: formData.arabicName,
        recipientPhone: formData.phone,
        recipientId: user?.id,
        registrationId: registration.id
      });

      toast.success('تم التسجيل بنجاح');
      
      setTimeout(() => {
        onSubmit();
      }, 500);

      return {
        id: registration.id,
        registrationNumber: registration.registration_number
      };
    } catch (error) {
      console.error('Error in registration:', error);
      toast.error(error instanceof Error ? error.message : 'حدث خطأ أثناء التسجيل');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
};
