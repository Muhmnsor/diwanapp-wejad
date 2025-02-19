
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { EventConfirmationCard } from "./EventConfirmationCard";
import { exportCardAsImage } from "@/utils/cardExport";

interface EventConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseRegistration: () => void;
  registrationId: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  location_url?: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
}

export const EventConfirmationDialog = ({
  open,
  onOpenChange,
  onCloseRegistration,
  registrationId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  location_url,
  formData,
}: EventConfirmationDialogProps) => {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const navigate = useNavigate();

  console.log('EventConfirmationDialog - Props:', {
    registrationId,
    eventTitle,
    eventLocation,
    location_url,
    formData
  });

  const handleDownload = async () => {
    console.log('Attempting to download confirmation card');
    const success = await exportCardAsImage(
      "confirmation-card",
      `تأكيد-التسجيل-${eventTitle}.png`
    );

    if (success) {
      console.log('Card downloaded successfully');
      setHasDownloaded(true);
      toast.success('تم حفظ بطاقة التأكيد بنجاح');
      
      // إغلاق نافذة التأكيد أولاً
      setTimeout(() => {
        onOpenChange(false);
        
        // ثم إغلاق نافذة التسجيل
        setTimeout(() => {
          onCloseRegistration();
          // توجيه المستخدم للصفحة الرئيسية
          setTimeout(() => {
            navigate('/');
          }, 500);
        }, 500);
      }, 500);
    } else {
      console.error('Failed to download card');
      toast.error('حدث خطأ أثناء حفظ البطاقة');
    }
  };

  const handleClose = () => {
    if (!hasDownloaded) {
      const shouldClose = window.confirm(
        "هل أنت متأكد من إغلاق نافذة التأكيد؟ لم تقم بحفظ التأكيد بعد."
      );
      if (!shouldClose) return;
    }
    
    // إغلاق نافذة التأكيد أولاً
    onOpenChange(false);
    
    // ثم إغلاق نافذة التسجيل
    setTimeout(() => {
      onCloseRegistration();
    }, 300);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleClose}
      modal={true}
    >
      <DialogContent 
        className="w-[95vw] max-w-lg mx-auto h-auto max-h-[90vh] overflow-y-auto p-4 md:p-6"
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
        
        <div className="mt-4">
          <EventConfirmationCard
            eventTitle={eventTitle}
            registrationId={registrationId}
            registrantInfo={formData}
            eventDetails={{
              date: eventDate,
              time: eventTime,
              location: eventLocation,
              location_url: location_url
            }}
          />
        </div>

        <div className="space-y-2 mt-4">
          <Button 
            onClick={handleDownload}
            className="w-full gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:shadow-md"
            variant="secondary"
            size="lg"
          >
            <Download className="w-5 h-5" />
            حفظ البطاقة
          </Button>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" />
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
