import { CalendarDays, MapPin } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  location: string;
}

export const EventCardDetails = ({ date, location }: EventCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 text-sm justify-end">
        <span>{date}</span>
        <CalendarDays size={16} />
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm justify-end">
        <span>{location}</span>
        <MapPin size={16} />
      </div>
    </>
  );
};