import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PersonalInfoFields } from "../../events/form/PersonalInfoFields";
import { PaymentFields } from "../../events/form/PaymentFields";

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
  const { id } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    arabicName: "",
    englishName: "",
    educationLevel: "",
    birthDate: "",
    nationalId: "",
    gender: "",
    workStatus: "",
  });

  const [registrationFields, setRegistrationFields] = useState<any>({
    arabic_name: true,
    email: true,
    phone: true,
    english_name: false,
    education_level: false,
    birth_date: false,
    national_id: false,
    gender: false,
    work_status: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRegistrationFields = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('event_registration_fields')
          .select('*')
          .eq('event_id', id)
          .single();

        if (error) throw error;

        if (data) {
          console.log('Fetched registration fields:', data);
          setRegistrationFields(data);
        }
      } catch (error) {
        console.error('Error fetching registration fields:', error);
      }
    };

    fetchRegistrationFields();
  }, [id]);

  const checkExistingRegistration = async (email: string) => {
    console.log("Checking for existing registration...");
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', id)
      .eq('email', email);

    if (error) {
      console.error('Error checking registration:', error);
      throw error;
    }

    return data && data.length > 0;
  };

  const processPayment = async (registrationData: any) => {
    console.log("Processing payment...");
    const { error: paymentError } = await supabase
      .from('payment_transactions')
      .insert({
        registration_id: registrationData.id,
        amount: eventPrice,
        status: 'completed',
        payment_method: 'card',
        payment_gateway: 'local_gateway'
      });

    if (paymentError) {
      console.error('Error processing payment:', paymentError);
      throw paymentError;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting registration process...");
    setIsSubmitting(true);

    try {
      const hasExistingRegistration = await checkExistingRegistration(formData.email);
      
      if (hasExistingRegistration) {
        toast.error("لقد قمت بالتسجيل في هذه الفعالية مسبقاً");
        return;
      }

      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const registrationData = {
        event_id: id,
        email: formData.email,
        phone: formData.phone,
        registration_number: uniqueId,
        arabic_name: formData.arabicName,
        english_name: registrationFields.english_name ? formData.englishName : null,
        education_level: registrationFields.education_level ? formData.educationLevel : null,
        birth_date: registrationFields.birth_date ? formData.birthDate : null,
        national_id: registrationFields.national_id ? formData.nationalId : null,
        gender: registrationFields.gender ? formData.gender : null,
        work_status: registrationFields.work_status ? formData.workStatus : null
      };

      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert(registrationData)
        .select()
        .single();

      if (registrationError) {
        console.error('Error submitting registration:', registrationError);
        throw registrationError;
      }

      if (eventPrice !== "free" && eventPrice !== null && eventPrice > 0) {
        const paymentSuccess = await processPayment(newRegistration);
        if (!paymentSuccess) {
          throw new Error('Payment processing failed');
        }
      }

      await queryClient.invalidateQueries({ 
        queryKey: ['registrations', id] 
      });
      
      toast.success("تم التسجيل بنجاح");
      onSubmit();
      
      console.log('Registration successful:', uniqueId);
    } catch (error) {
      console.error('Error in registration process:', error);
      toast.error("لم نتمكن من إكمال عملية التسجيل، يرجى المحاولة مرة أخرى");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  const getButtonText = () => {
    if (isSubmitting) {
      return "جاري المعالجة...";
    }
    if (isPaidEvent) {
      return `الدفع وتأكيد التسجيل (${eventPrice} ريال)`;
    }
    return "تأكيد التسجيل";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <PersonalInfoFields
        formData={formData}
        setFormData={setFormData}
        registrationFields={registrationFields}
      />
      
      {isPaidEvent && (
        <PaymentFields
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
        />
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {getButtonText()}
      </Button>
    </form>
  );
};