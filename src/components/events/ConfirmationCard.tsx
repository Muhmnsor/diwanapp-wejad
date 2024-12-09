import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportCardAsImage } from "@/utils/cardExport";
import { ConfirmationHeader } from "./ConfirmationHeader";
import { ConfirmationQR } from "./ConfirmationQR";
import { ConfirmationDetails } from "./ConfirmationDetails";

interface ConfirmationCardProps {
  eventTitle: string;
  registrationId: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  onSave?: () => void;
}

export const ConfirmationCard = ({
  eventTitle,
  registrationId,
  formData,
  eventDate,
  eventTime,
  eventLocation,
  onSave
}: ConfirmationCardProps) => {
  const { toast } = useToast();

  const handleSaveCard = async () => {
    console.log("Save card button clicked");
    const success = await exportCardAsImage(
      "confirmation-card",
      `تأكيد-التسجيل-${eventTitle}.png`
    );

    if (success) {
      console.log("Card saved successfully");
      toast({
        title: "تم حفظ البطاقة بنجاح",
        description: "تم تنزيل البطاقة على جهازك",
      });
      if (onSave) onSave();
    } else {
      console.log("Failed to save card");
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ البطاقة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card id="confirmation-card" className="bg-white p-6 space-y-6">
        <ConfirmationHeader 
          eventTitle={eventTitle} 
          registrationId={registrationId} 
        />
        <ConfirmationQR registrationId={registrationId} />
        <ConfirmationDetails
          formData={formData}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
        />
      </Card>

      <Button 
        onClick={handleSaveCard} 
        className="w-full gap-2"
        variant="secondary"
        size="lg"
      >
        <Download className="w-5 h-5" />
        حفظ البطاقة
      </Button>
    </div>
  );
};