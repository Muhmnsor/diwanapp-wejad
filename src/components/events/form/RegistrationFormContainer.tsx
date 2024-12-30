import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { PersonalInfoFields } from "./PersonalInfoFields";
import { PaymentFields } from "./PaymentFields";
import { RegistrationConfirmation } from "../RegistrationConfirmation";

interface RegistrationFormContainerProps {
  eventTitle: string;
  eventPrice: number | "free" | null;
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
    arabic_name: "",
    english_name: "",
    education_level: "",
    birth_date: "",
    national_id: "",
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

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
    <>
      {!isRegistered && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <PersonalInfoFields
            formData={formData}
            setFormData={setFormData}
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
        onPayment={() => {}}
      />
    </>
  );
};