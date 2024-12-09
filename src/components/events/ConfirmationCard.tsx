import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { toast } from "sonner";

interface ConfirmationCardProps {
  eventTitle: string;
  registrationId: string;
  formData?: {
    name: string;
    email: string;
    phone: string;
  };
}

export const ConfirmationCard = ({
  eventTitle,
  registrationId,
}: ConfirmationCardProps) => {
  const handleSaveCard = async () => {
    console.log("Attempting to save confirmation card");
    const element = document.getElementById("confirmation-card");
    if (element) {
      try {
        const dataUrl = await htmlToImage.toPng(element);
        const link = document.createElement("a");
        link.download = `تأكيد-التسجيل-${eventTitle}.png`;
        link.href = dataUrl;
        link.click();
        
        toast.success("تم حفظ البطاقة بنجاح");
        console.log("Card saved successfully");
      } catch (error) {
        console.error("Error saving card:", error);
        toast.error("حدث خطأ أثناء حفظ البطاقة");
      }
    }
  };

  // استخراج الرقم المختصر مباشرة
  const shortRegistrationId = registrationId.split('-').pop() || registrationId;

  return (
    <div className="space-y-4">
      <div id="confirmation-card" className="bg-white p-6 rounded-lg space-y-6">
        <div className="text-center">
          <h3 className="font-bold text-xl">{eventTitle}</h3>
        </div>
        
        <div className="flex justify-center py-4">
          <QRCodeSVG
            value={shortRegistrationId}
            size={200}
            level="H"
            includeMargin
            className="border-8 border-white"
          />
        </div>

        <div className="flex justify-center pt-4">
          <img 
            src="/lovable-uploads/5779ac2f-5bd9-4178-8726-fa477d637cbf.png"
            alt="ديوان الشبابية"
            className="h-16 w-auto object-contain"
          />
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={handleSaveCard} variant="secondary">
          <Download className="mr-2 h-4 w-4" />
          حفظ البطاقة
        </Button>
      </div>
    </div>
  );
};