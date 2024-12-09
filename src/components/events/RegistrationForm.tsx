import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { RegistrationFormInputs } from "./RegistrationFormInputs";
import { RegistrationConfirmation } from "./RegistrationConfirmation";

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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [registrationId, setRegistrationId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    
    const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setRegistrationId(uniqueId);
    
    // أولاً نظهر نافذة التأكيد
    setShowConfirmation(true);
    
    // ثم نظهر رسالة النجاح بعد تأخير بسيط
    setTimeout(() => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "سيتم التواصل معك قريباً",
      });
      onSubmit();
    }, 500);
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
        <Button type="submit" className="w-full">تأكيد التسجيل</Button>
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