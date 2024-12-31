import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/Logo";
import { Card } from "@/components/ui/card";
import { Ticket } from "lucide-react";

interface EventConfirmationCardProps {
  eventTitle: string;
  registrationId: string;
  registrantInfo: {
    name: string;
    email: string;
    phone: string;
  };
  eventDetails?: {
    date?: string;
    time?: string;
    location?: string;
  };
}

export const EventConfirmationCard = ({
  eventTitle,
  registrationId,
  registrantInfo,
  eventDetails
}: EventConfirmationCardProps) => {
  console.log('Rendering EventConfirmationCard with:', {
    eventTitle,
    registrationId,
    registrantInfo,
    eventDetails
  });

  return (
    <Card id="confirmation-card" className="bg-white p-6 space-y-6 max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <Ticket className="w-8 h-8 text-primary" />
      </div>
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right space-y-2">
          <h3 className="font-bold text-xl">{eventTitle}</h3>
          <p className="text-sm text-muted-foreground">
            رقم التسجيل: {registrationId.split('-').pop()}
          </p>
        </div>
        <Logo className="w-16 h-16" />
      </div>

      {/* QR Code */}
      <div className="flex justify-center py-4">
        <QRCodeSVG
          value={registrationId}
          size={150}
          level="H"
          includeMargin={true}
          className="qr-code"
        />
      </div>

      {/* Registrant Details */}
      <div className="space-y-4 text-right">
        <div className="space-y-2">
          <p className="text-sm font-medium">معلومات المسجل:</p>
          <div className="text-sm space-y-1">
            <p>الاسم: {registrantInfo.name}</p>
            <p>البريد الإلكتروني: {registrantInfo.email}</p>
            <p>رقم الجوال: {registrantInfo.phone}</p>
          </div>
        </div>

        {eventDetails && (
          <div className="space-y-2">
            {eventDetails.date && (
              <p className="text-sm">
                التاريخ: {eventDetails.date}
              </p>
            )}
            {eventDetails.time && (
              <p className="text-sm">
                الوقت: {eventDetails.time}
              </p>
            )}
            {eventDetails.location && (
              <p className="text-sm">
                المكان: {eventDetails.location}
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};