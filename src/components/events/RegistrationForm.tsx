import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { QRCodeSVG } from "qrcode.react";
import * as htmlToImage from "html-to-image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface RegistrationFormProps {
  eventTitle: string;
  eventPrice: number | "free";
  onSubmit: () => void;
}

export const RegistrationForm = ({ eventTitle, eventPrice, onSubmit }: RegistrationFormProps) => {
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
    
    // Generate a unique registration ID
    const uniqueId = `REG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setRegistrationId(uniqueId);
    
    // Show success message
    toast({
      title: "تم التسجيل بنجاح",
      description: "سيتم التواصل معك قريباً",
    });

    // Show confirmation dialog with QR code
    setShowConfirmation(true);
    
    onSubmit();
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

  const handlePayment = () => {
    toast({
      title: "جاري تحويلك لبوابة الدفع",
      description: "يرجى الانتظار...",
    });
  };

  const handleCloseDialog = () => {
    // Only close if user explicitly clicks the close button
    if (window.confirm("هل أنت متأكد من إغلاق نافذة التأكيد؟ تأكد من حفظ التأكيد أولاً.")) {
      setShowConfirmation(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-right block">الاسم</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-right block">البريد الإلكتروني</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-right block">رقم الجوال</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>
        
        {eventPrice !== "free" && (
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-center mb-2">رسوم التسجيل: {eventPrice} ريال</p>
            <p className="text-sm text-muted-foreground text-center">
              سيتم تحويلك إلى صفحة الدفع بعد تأكيد التسجيل
            </p>
          </div>
        )}

        <Button type="submit" className="w-full">تأكيد التسجيل</Button>
      </form>

      <Dialog 
        open={showConfirmation} 
        onOpenChange={handleCloseDialog}
      >
        <DialogContent className="max-w-md" onPointerDownOutside={(e) => {
          e.preventDefault();
        }}>
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
              <Button onClick={handlePayment} variant="secondary" className="flex-1">
                الانتقال للدفع
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};