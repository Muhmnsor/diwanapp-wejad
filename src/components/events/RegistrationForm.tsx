import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RegistrationFormInputs } from "./RegistrationFormInputs";
import { RegistrationConfirmation } from "./RegistrationConfirmation";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free";
  onSubmit: () => void;
}

export const RegistrationForm = ({ 
  eventTitle, 
  eventPrice, 
  onSubmit 
}: RegistrationFormProps) => {
  const { toast } = useToast();
  const { id: eventId } = useParams();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkExistingRegistration = async (email: string) => {
    console.log("Checking for existing registration...");
    const { data, error } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('email', email);

    if (error) {
      console.error('Error checking registration:', error);
      throw error;
    }

    return data && data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Starting registration process...");
    setIsSubmitting(true);

    try {
      // التحقق من وجود تسجيل سابق
      const hasExistingRegistration = await checkExistingRegistration(formData.email);
      
      if (hasExistingRegistration) {
        toast({
          variant: "destructive",
          title: "لا يمكن إكمال التسجيل",
          description: "لقد قمت بالتسجيل في هذه الفعالية مسبقاً",
        });
        return;
      }

      // Generate a unique registration number
      const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Insert the registration into Supabase
      const { error } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          registration_number: uniqueId
        });

      if (error) {
        console.error('Error submitting registration:', error);
        toast({
          variant: "destructive",
          title: "حدث خطأ",
          description: "لم نتمكن من إكمال عملية التسجيل، يرجى المحاولة مرة أخرى",
        });
        return;
      }

      // Update the registration count in the UI
      await queryClient.invalidateQueries({ queryKey: ['registrations', eventId] });
      
      setRegistrationId(uniqueId);
      setShowConfirmation(true);
      onSubmit();
      
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

  const handlePayment = () => {
    toast({
      title: "جاري تحويلك لبوابة الدفع",
      description: "يرجى الانتظار...",
    });
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <RegistrationFormInputs
          formData={formData}
          setFormData={setFormData}
          eventPrice={eventPrice}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "جاري التسجيل..." : "تأكيد التسجيل"}
        </Button>
      </form>

      <RegistrationConfirmation
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        registrationId={registrationId}
        eventTitle={eventTitle}
        eventPrice={eventPrice}
        formData={formData}
        onPayment={handlePayment}
      />
    </>
  );
};