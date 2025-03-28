
import { CalendarDays, MapPin } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  location: string;
}

export const EventCardDetails = ({ date, location }: EventCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 text-sm" dir="rtl">
        <CalendarDays size={16} />
        <span>موعد الفعالية:</span>
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm" dir="rtl">
        <MapPin size={16} />
        <span>المكان:</span>
        <span>{location}</span>
      </div>
    </>
  );
};
