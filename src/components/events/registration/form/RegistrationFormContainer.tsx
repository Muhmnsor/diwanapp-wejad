import { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthError } from "@supabase/supabase-js";
import { RegistrationFormContainer as BaseRegistrationFormContainer } from "../RegistrationFormContainer";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
}

export const RegistrationFormContainer = ({
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit
}: RegistrationFormContainerProps) => {
  const navigate = useNavigate();

  const handleFormSubmit = async (e: FormEvent) => {
    console.log('RegistrationFormContainer - Form submitted');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      
      if (!session) {
        console.log('No active session, redirecting to login');
        toast.error("يرجى تسجيل الدخول للمتابعة");
        navigate('/login');
        return;
      }

      e.preventDefault();
      onSubmit();
      console.log('RegistrationFormContainer - Form submission successful');
    } catch (error) {
      console.error('RegistrationFormContainer - Form submission failed:', error);
      
      const authError = error as AuthError;
      if (authError.message?.includes('refresh_token_not_found') || 
          authError.message?.includes('JWT expired')) {
        toast.error("انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى");
        navigate('/login');
        return;
      }
      
      toast.error("حدث خطأ أثناء التسجيل");
    }
  };

  return (
    <BaseRegistrationFormContainer
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={handleFormSubmit}
    />
  );
};