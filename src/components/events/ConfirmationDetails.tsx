import { CalendarDays, MapPin, Clock } from "lucide-react";

interface ConfirmationDetailsProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export const ConfirmationDetails = ({
  formData,
  eventDate,
  eventTime,
  eventLocation,
}: ConfirmationDetailsProps) => {
  return (
    <div className="space-y-4 text-right">
      <div className="space-y-2">
        <p className="text-sm font-medium">معلومات المسجل:</p>
        <div className="text-sm space-y-1">
          <p>الاسم: {formData.name}</p>
          <p>البريد الإلكتروني: {formData.email}</p>
          <p>رقم الجوال: {formData.phone}</p>
        </div>
      </div>

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
  );
};