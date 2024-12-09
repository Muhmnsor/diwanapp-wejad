import { QRCodeSVG } from "qrcode.react";

interface ConfirmationCardProps {
  eventTitle: string;
  registrationId: string;
  formData: {
    name: string;
    email: string;
    phone: string;
  };
}

export const ConfirmationCard = ({
  eventTitle,
  registrationId,
  formData,
}: ConfirmationCardProps) => {
  return (
    <div id="confirmation-card" className="bg-white p-6 rounded-lg space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">{eventTitle}</h3>
        <div className="text-muted-foreground">رقم التسجيل: {registrationId}</div>
      </div>
      
      <div className="flex justify-center py-4">
        <QRCodeSVG
          value={registrationId}
          size={200}
          level="H"
          includeMargin
          className="border-8 border-white"
        />
      </div>

      <div className="space-y-2">
        <div className="font-semibold">معلومات المسجل:</div>
        <div>الاسم: {formData.name}</div>
        <div>البريد الإلكتروني: {formData.email}</div>
        <div>رقم الجوال: {formData.phone}</div>
      </div>
    </div>
  );
};