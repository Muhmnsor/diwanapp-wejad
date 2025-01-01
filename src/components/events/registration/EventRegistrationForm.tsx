import { RegistrationFormContainer } from "./RegistrationFormContainer";
import { EventRegistrationConfirmation } from "./confirmation/EventRegistrationConfirmation";
import { useRegistration } from "./hooks/useRegistration";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface EventRegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const EventRegistrationForm = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
}: EventRegistrationFormProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session check error:', error);
        toast.error("حدث خطأ في التحقق من الجلسة");
        navigate('/login');
        return;
      }
      if (!session) {
        console.log('No active session found, redirecting to login');
        navigate('/login');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const {
    formData,
    showConfirmation,
    setShowConfirmation,
    registrationId,
    isRegistered,
    handleSubmit
  } = useRegistration(() => {
    console.log('EventRegistrationForm - Registration successful, calling onSubmit');
    onSubmit();
  }, false);

  console.log('EventRegistrationForm - Current state:', {
    showConfirmation,
    isRegistered,
    registrationId,
    formData
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    console.log('EventRegistrationForm - Form submitted');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, redirecting to login');
        toast.error("يرجى تسجيل الدخول للمتابعة");
        navigate('/login');
        return;
      }

      await handleSubmit(e);
      console.log('EventRegistrationForm - Form submission successful');
    } catch (error) {
      console.error('EventRegistrationForm - Form submission failed:', error);
      if (error.message?.includes('refresh_token_not_found')) {
        toast.error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
        navigate('/login');
        return;
      }
      toast.error("حدث خطأ أثناء التسجيل");
    }
  };

  if (showConfirmation && isRegistered) {
    console.log('EventRegistrationForm - Showing confirmation dialog');
    return (
      <EventRegistrationConfirmation
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        registrationId={registrationId}
        eventTitle={eventTitle}
        eventDate={eventDate}
        eventTime={eventTime}
        eventLocation={eventLocation}
        formData={{
          name: formData.arabicName,
          email: formData.email,
          phone: formData.phone
        }}
      />
    );
  }

  console.log('EventRegistrationForm - Showing registration form');
  return (
    <RegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={handleFormSubmit}
    />
  );
};