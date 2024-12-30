import { useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { RegistrationFormInputs } from "../RegistrationFormInputs";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
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
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const checkExistingRegistration = async (email: string) => {
    console.log('Checking existing registration for:', { email, id, isProject });
    
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq(isProject ? 'project_id' : 'event_id', id)
      .eq('email', email);

    if (error) {
      console.error('Error checking registration:', error);
      throw error;
    }

    return data?.length > 0;
  };

  const handleSubmit = async (formData: any) => {
    try {
      setLoading(true);
      const existing = await checkExistingRegistration(formData.email);
      if (existing) {
        toast({
          variant: "destructive",
          title: "تسجيل موجود",
          description: "هذا البريد الإلكتروني مسجل بالفعل."
        });
        return;
      }

      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        registration_number: uniqueId,
        arabic_name: formData.arabic_name || null,
        english_name: formData.english_name || null,
        education_level: formData.education_level || null,
        birth_date: formData.birth_date || null,
        national_id: formData.national_id || null,
      };

      if (isProject) {
        registrationData['project_id'] = id;
      } else {
        registrationData['event_id'] = id;
      }
      
      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (registrationError) {
        console.error('Error creating registration:', registrationError);
        throw registrationError;
      }

      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في الفعالية."
      });
      onSubmit();
    } catch (error) {
      console.error('Error in form submission:', error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "حدث خطأ أثناء إرسال النموذج. يرجى المحاولة مرة أخرى."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegistrationFormInputs
      eventTitle={eventTitle}
      eventPrice={eventPrice}
      eventDate={eventDate}
      eventTime={eventTime}
      eventLocation={eventLocation}
      onSubmit={handleSubmit}
    />
  );
};
