import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Clock, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="space-y-4" dir="rtl">
      <Card id="confirmation-card" className="bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-right space-y-2">
            <h3 className="font-bold text-xl">{eventTitle}</h3>
            <p className="text-sm text-muted-foreground">رقم التسجيل: {registrationId.split('-').pop()}</p>
          </div>
          <Logo />
        </div>

        <div className="flex justify-center py-4">
          <QRCodeSVG
            value={registrationId}
            size={150}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="space-y-3">
          {eventDate && (
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays size={16} className="text-primary" />
              <span>{eventDate}</span>
            </div>
          )}
          
          {eventTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock size={16} className="text-primary" />
              <span>{eventTime}</span>
            </div>
          )}
          
          {eventLocation && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin size={16} className="text-primary" />
              <span>{eventLocation}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Event Image */}
      <div className="rounded-lg overflow-hidden">
        <img 
          src="/lovable-uploads/4ab86edd-10cb-4a50-a6cf-2b343c2361db.png"
          alt={eventTitle}
          className="w-full h-48 object-cover"
        />
      </div>

      {/* Save Button */}
      <Button 
        onClick={onSave} 
        className="w-full"
        variant="secondary"
      >
        <Download className="ml-2" />
        حفظ البطاقة
      </Button>
    </div>
  );
};