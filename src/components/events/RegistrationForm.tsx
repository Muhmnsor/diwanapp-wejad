import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RegistrationFormInputs } from "./RegistrationFormInputs";
import { RegistrationConfirmation } from "./RegistrationConfirmation";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  onSubmit: () => void;
  isProject?: boolean;
}

export const RegistrationForm = ({ 
  eventTitle, 
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  onSubmit,
  isProject = false
}: RegistrationFormProps) => {
  const { toast } = useToast();
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
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  // Fetch registration field settings
  const { data: registrationFields } = useQuery({
    queryKey: ['registration-fields', id],
    queryFn: async () => {
      console.log('Fetching registration fields for:', id);
      const { data, error } = await supabase
        .from(isProject ? 'project_registration_fields' : 'event_registration_fields')
        .select('*')
        .eq(isProject ? 'project_id' : 'event_id', id)
        .single();

      if (error) {
        console.error('Error fetching registration fields:', error);
        throw error;
      }

      console.log('Fetched registration fields:', data);
      return data || {
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
    },
  });

  const checkExistingRegistration = async (email: string) => {
    console.log("Checking for existing registration...");
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq(isProject ? 'project_id' : 'event_id', id)
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
        toast({
          variant: "destructive",
          title: "لا يمكن إكمال التسجيل",
          description: "لقد قمت بالتسجيل في هذه الفعالية مسبقاً",
        });
        return;
      }

      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const registrationData = {
        arabic_name: formData.arabicName,
        email: formData.email,
        phone: formData.phone,
        registration_number: uniqueId,
        english_name: registrationFields?.english_name ? formData.englishName : null,
        education_level: registrationFields?.education_level ? formData.educationLevel : null,
        birth_date: registrationFields?.birth_date ? formData.birthDate : null,
        national_id: registrationFields?.national_id ? formData.nationalId : null,
        gender: registrationFields?.gender ? formData.gender : null,
        work_status: registrationFields?.work_status ? formData.workStatus : null,
      };

      if (isProject) {
        registrationData['project_id'] = id;
      } else {
        registrationData['event_id'] = id;
      }
      
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
      
      setRegistrationId(uniqueId);
      setShowConfirmation(true);
      setIsRegistered(true);
      
      console.log('Registration successful:', uniqueId);
    } catch (error) {
      console.error('Error in registration process:', error);
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: "لم نتمكن من إكمال عملية التسجيل، يرجى المحاولة مرة أخرى",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine if this is a paid event
  const isPaidEvent = eventPrice !== "free" && eventPrice !== null && eventPrice > 0;

  // Get the appropriate button text based on event price
  const getButtonText = () => {
    if (isSubmitting) {
      return "جاري المعالجة...";
    }
    if (isPaidEvent) {
      return `الدفع وتأكيد التسجيل (${eventPrice} ريال)`;
    }
    return "تأكيد التسجيل";
  };

  if (!registrationFields) {
    return null;
  }

  return (
    <>
      {!isRegistered && (
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
            {getButtonText()}
          </Button>
        </form>
      )}

      <RegistrationConfirmation
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        registrationId={registrationId}
        eventTitle={eventTitle}
        eventPrice={eventPrice}
        eventDate={eventDate}
        eventTime={eventTime}
        eventLocation={eventLocation}
        formData={formData}
        isProjectActivity={isProject}
        onPayment={() => {}}
      />
    </>
  );
};