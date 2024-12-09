import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, MapPin, Clock } from "lucide-react";

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
}

export const ConfirmationCard = ({
  eventTitle,
  registrationId,
  formData,
  eventDate,
  eventTime,
  eventLocation
}: ConfirmationCardProps) => {
  return (
    <Card id="confirmation-card" className="bg-white p-6 space-y-4">
      <div className="text-center space-y-2">
        <h3 className="font-bold text-xl">{eventTitle}</h3>
        <p className="text-sm text-muted-foreground">رقم التسجيل: {registrationId.split('-').pop()}</p>
      </div>

      <div className="space-y-3">
        {eventDate && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays size={16} className="text-muted-foreground" />
            <span>{eventDate}</span>
          </div>
        )}
        
        {eventTime && (
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-muted-foreground" />
            <span>{eventTime}</span>
          </div>
        )}
        
        {eventLocation && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin size={16} className="text-muted-foreground" />
            <span>{eventLocation}</span>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <div className="text-sm">
          <span className="font-medium">الاسم:</span> {formData.name}
        </div>
        <div className="text-sm">
          <span className="font-medium">البريد الإلكتروني:</span> {formData.email}
        </div>
        <div className="text-sm">
          <span className="font-medium">رقم الجوال:</span> {formData.phone}
        </div>
      </div>
    </Card>
  );
};