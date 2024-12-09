import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/Logo";

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
  return (
    <div id="confirmation-card" className="bg-white p-6 rounded-lg space-y-6">
      <div className="text-center">
        <h3 className="font-bold text-xl">{eventTitle}</h3>
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

      <div className="flex justify-center pt-4">
        <Logo />
      </div>
    </div>
  );
};