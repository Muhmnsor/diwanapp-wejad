import { CalendarDays, Clock, MapPin, Users, Monitor, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatTime12Hour, formatDateWithDay } from "@/utils/dateTimeUtils";
import { BeneficiaryType } from "@/types/event";

interface EventInfoProps {
  date: string;
  time: string;
  location: string;
  attendees: number | Array<any>;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  eventHours?: number;
}

export const EventInfo = ({ 
  date, 
  time, 
  location, 
  attendees, 
  maxAttendees,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours
}: EventInfoProps) => {
  const attendeesCount = Array.isArray(attendees) ? attendees.length : attendees;
  const remainingSeats = maxAttendees - attendeesCount;
  
  const formattedDate = formatDateWithDay(date);
  const formattedTime = formatTime12Hour(time);

  const getBeneficiaryLabel = (type: string) => {
    switch (type) {
      case 'men':
        return 'رجال';
      case 'women':
        return 'نساء';
      case 'children':
        return 'أطفال';
      case 'all':
        return 'الجميع';
      default:
        return 'رجال ونساء';
    }
  };

  const getCertificateLabel = (type: string | undefined) => {
    if (!type || type === 'none') return null;
    switch (type) {
      case 'attendance':
        return 'شهادة حضور';
      case 'certified':
        return 'شهادة معتمدة';
      default:
        return type;
    }
  };
  
  return (
    <div className="space-y-8 mb-12">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={eventType === "online" ? "secondary" : "default"} className="rounded-full px-4 py-1">
          {eventType === "online" ? "عن بعد" : "حضوري"}
        </Badge>
        <Badge variant="outline" className="rounded-full px-4 py-1">
          {price === "free" ? "مجاني" : `${price} ريال`}
        </Badge>
        <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {getBeneficiaryLabel(beneficiaryType)}
        </Badge>
        {certificateType && certificateType !== 'none' && (
          <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
            <Award className="w-4 h-4" />
            {getCertificateLabel(certificateType)}
          </Badge>
        )}
        {eventHours && eventHours > 0 && (
          <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {eventHours} {eventHours === 1 ? 'ساعة' : 'ساعات'} تدريبية
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[#1A1F2C]">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[#1A1F2C]">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            {eventType === "online" ? (
              <Monitor className="h-5 w-5 text-primary" />
            ) : (
              <MapPin className="h-5 w-5 text-primary" />
            )}
          </div>
          <span className="text-[#1A1F2C]">{location}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <span className="text-[#1A1F2C]">
            {attendeesCount} مشارك 
            {remainingSeats > 0 && ` (متبقي ${remainingSeats} مقعد)`}
          </span>
        </div>
      </div>
    </div>
  );
};