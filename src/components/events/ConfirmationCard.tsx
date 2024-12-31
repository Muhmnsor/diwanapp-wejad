import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Ticket } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportCardAsImage } from "@/utils/cardExport";
import { ConfirmationHeader } from "./ConfirmationHeader";
import { ConfirmationQR } from "./ConfirmationQR";
import { ConfirmationDetails } from "./ConfirmationDetails";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { useEffect } from "react";

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
  isProjectActivity?: boolean;
  projectTitle?: string;
  onSave?: () => void;
}

export const ConfirmationCard = ({
  eventTitle,
  registrationId,
  formData,
  eventDate,
  eventTime,
  eventLocation,
  isProjectActivity,
  projectTitle,
  onSave
}: ConfirmationCardProps) => {
  const { toast } = useToast();
  const formattedTime = eventTime ? formatTime12Hour(eventTime) : undefined;

  useEffect(() => {
    console.log('ConfirmationCard - Component mounted with props:', {
      eventTitle,
      registrationId,
      formData,
      eventDate,
      eventTime,
      eventLocation,
      isProjectActivity,
      projectTitle
    });
  }, []);

  const handleSaveCard = async () => {
    console.log("Save card button clicked");
    const success = await exportCardAsImage(
      "confirmation-card",
      `تأكيد-التسجيل-${isProjectActivity ? projectTitle : eventTitle}.png`
    );

    if (success) {
      console.log("Card saved successfully");
      toast({
        title: "تم حفظ البطاقة بنجاح",
        description: "تم تنزيل البطاقة على جهازك",
      });
      if (onSave) {
        console.log("Calling onSave callback");
        onSave();
      }
    } else {
      console.log("Failed to save card");
      toast({
        title: "حدث خطأ",
        description: "لم نتمكن من حفظ البطاقة، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const displayTitle = isProjectActivity ? `${eventTitle} (${projectTitle})` : eventTitle;

  return (
    <div className="space-y-4" dir="rtl">
      <Card id="confirmation-card" className="bg-white p-6 space-y-6 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <Ticket className="w-8 h-8 text-primary" />
          {!isProjectActivity && projectTitle && (
            <div className="text-xs text-muted-foreground">
              تسجيل في مشروع: {projectTitle}
            </div>
          )}
        </div>
        
        <ConfirmationHeader 
          eventTitle={displayTitle} 
          registrationId={registrationId} 
        />
        <ConfirmationQR registrationId={registrationId} />
        <ConfirmationDetails
          formData={formData}
          eventDate={eventDate}
          eventTime={formattedTime}
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