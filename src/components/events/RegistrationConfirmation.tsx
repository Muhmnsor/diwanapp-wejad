import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import { useToast } from "@/components/ui/use-toast";

interface RegistrationConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registrationId: string;
  eventTitle: string;
  eventPrice: number | "free";
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
  formData,
  onPayment,
}: RegistrationConfirmationProps) => {
  const { toast } = useToast();

  const handleCloseDialog = () => {
    if (window.confirm("هل أنت متأكد من إغلاق نافذة التأكيد؟ تأكد من حفظ التأكيد أولاً.")) {
      onOpenChange(false);
    }
  };

  const handleSaveConfirmation = async () => {
    const element = document.getElementById("confirmation-card");
    if (element) {
      try {
        const dataUrl = await htmlToImage.toPng(element);
        const link = document.createElement("a");
        link.download = `تأكيد-التسجيل-${eventTitle}.png`;
        link.href = dataUrl;
        link.click();
        
        toast({
          title: "تم حفظ التأكيد بنجاح",
          description: "يمكنك الآن إغلاق النافذة",
        });
      } catch (error) {
        console.error("Error saving confirmation:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ التأكيد",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <Dialog 
      open={open}
      modal={true}
    >
      <DialogContent 
        className="max-w-md"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-center mb-4">تأكيد التسجيل</DialogTitle>
          <DialogDescription className="text-center">
            يرجى حفظ هذا التأكيد أو تصويره قبل الإغلاق
          </DialogDescription>
        </DialogHeader>
        
        <div id="confirmation-card" className="bg-white p-6 rounded-lg space-y-4">
          <div className="text-center space-y-2">
            <h3 className="font-bold text-xl">{eventTitle}</h3>
            <p className="text-muted-foreground">رقم التسجيل: {registrationId}</p>
          </div>
          
          <div className="flex justify-center py-4">
            <QRCodeSVG
              value={registrationId}
              size={200}
              level="H"
              includeMargin
            />
          </div>

          <div className="space-y-2">
            <p className="font-semibold">معلومات المسجل:</p>
            <p>الاسم: {formData.name}</p>
            <p>البريد الإلكتروني: {formData.email}</p>
            <p>رقم الجوال: {formData.phone}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSaveConfirmation} className="flex-1">
            حفظ التأكيد
          </Button>
          {eventPrice !== "free" && (
            <Button onClick={onPayment} variant="secondary" className="flex-1">
              الانتقال للدفع
            </Button>
          )}
          <Button onClick={handleCloseDialog} variant="outline" className="flex-1">
            إغلاق
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};