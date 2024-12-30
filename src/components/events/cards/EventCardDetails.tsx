import { CalendarDays, MapPin } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  location: string;
}

export const EventCardDetails = ({ date, location }: EventCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <CalendarDays size={16} />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <MapPin size={16} />
        <span>{location}</span>
      </div>
    </>
  );
};