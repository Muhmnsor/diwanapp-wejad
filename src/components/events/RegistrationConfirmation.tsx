import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import * as htmlToImage from "html-to-image";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { ConfirmationCard } from "./ConfirmationCard";
import { ConfirmationActions } from "./ConfirmationActions";

interface RegistrationConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventPrice: number | "free";
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  onPayment: () => void;
}

export const RegistrationConfirmation = ({
  open,
  onOpenChange,
  registrationId,
  eventTitle,
  eventPrice,
  eventDate,
  eventTime,
  eventLocation,
  formData,
  onPayment,
}: RegistrationConfirmationProps) => {
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);

  useEffect(() => {
    if (open) {
      setIsClosing(false);
      setHasDownloaded(false);
      console.log("Dialog opened, states reset");
    }
  }, [open]);

  const handleCloseDialog = () => {
    if (!hasDownloaded) {
      const shouldClose = window.confirm("هل أنت متأكد من إغلاق نافذة التأكيد؟ لم تقم بحفظ التأكيد بعد.");
      if (!shouldClose) {
        return;
      }
    }
    setIsClosing(true);
    onOpenChange(false);
  };

  const handleSaveConfirmation = async () => {
    console.log("Attempting to save confirmation");
    const element = document.getElementById("confirmation-card");
    if (!element) {
      console.error("Confirmation card element not found");
      return;
    }

    try {
      // Create a clone of the element to modify
      const clone = element.cloneNode(true) as HTMLElement;
      document.body.appendChild(clone);
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.backgroundColor = '#ffffff';

      // Generate image from the clone
      const dataUrl = await htmlToImage.toJpeg(clone, {
        quality: 0.95,
        backgroundColor: '#ffffff',
        canvasWidth: element.offsetWidth * 2,
        canvasHeight: element.offsetHeight * 2,
        pixelRatio: 2,
      });

      // Remove the clone
      document.body.removeChild(clone);

      // Create and trigger download
      const link = document.createElement("a");
      link.download = `تأكيد-التسجيل-${eventTitle}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      
      console.log("Triggering download");
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      
      setHasDownloaded(true);
      toast({
        title: "تم حفظ التأكيد بنجاح",
        description: "يمكنك الآن إغلاق النافذة",
      });
      console.log("Confirmation saved successfully");
    } catch (error) {
      console.error("Error saving confirmation:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التأكيد",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleCloseDialog();
        }
      }}
    >
      <DialogContent 
        className="max-w-md mx-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-center">تم التسجيل بنجاح!</DialogTitle>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <div>سيتم التواصل معك قريباً</div>
            <div className="font-medium">يرجى حفظ هذا التأكيد أو تصويره قبل الإغلاق</div>
          </div>
        </DialogHeader>
        
        <ConfirmationCard
          eventTitle={eventTitle}
          registrationId={registrationId}
          formData={formData}
          eventDate={eventDate}
          eventTime={eventTime}
          eventLocation={eventLocation}
          onSave={handleSaveConfirmation}
        />

        <ConfirmationActions
          onSave={handleSaveConfirmation}
          onClose={handleCloseDialog}
          onPayment={onPayment}
          showPayment={eventPrice !== "free"}
        />
      </DialogContent>
    </Dialog>
  );
};