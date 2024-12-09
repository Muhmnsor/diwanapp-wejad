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
      <Card id="confirmation-card" className="bg-white p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-right space-y-2">
            <h3 className="font-bold text-xl">{eventTitle}</h3>
            <p className="text-sm text-muted-foreground">رقم التسجيل: {registrationId.split('-').pop()}</p>
          </div>
          <Logo className="w-16 h-16" />
        </div>

        <div className="flex justify-center py-4">
          <QRCodeSVG
            value={registrationId}
            size={150}
            level="H"
            includeMargin={true}
          />
        </div>

        <div className="space-y-4 text-right">
          {eventDate && (
            <div className="flex items-center gap-3 text-sm">
              <CalendarDays size={20} className="text-primary shrink-0" />
              <span className="font-medium">{eventDate}</span>
            </div>
          )}
          
          {eventTime && (
            <div className="flex items-center gap-3 text-sm">
              <Clock size={20} className="text-primary shrink-0" />
              <span className="font-medium">{eventTime}</span>
            </div>
          )}
          
          {eventLocation && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={20} className="text-primary shrink-0" />
              <span className="font-medium">{eventLocation}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Event Image */}
      <div className="rounded-lg overflow-hidden h-48">
        <img 
          src="/lovable-uploads/4ab86edd-10cb-4a50-a6cf-2b343c2361db.png"
          alt={eventTitle}
          className="w-full h-full object-contain bg-secondary/50"
        />
      </div>

      {/* Save Button */}
      <Button 
        onClick={onSave} 
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