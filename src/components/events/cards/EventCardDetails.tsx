import { CalendarDays, MapPin } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  location: string;
}

export const EventCardDetails = ({ date, location }: EventCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center justify-end gap-2 text-gray-600 text-sm">
        <span>{date}</span>
        <CalendarDays size={16} />
      </div>
      <div className="flex items-center justify-end gap-2 text-gray-600 text-sm">
        <span>{location}</span>
        <MapPin size={16} />
      </div>
    </>
  );
};