import { CalendarDays, MapPin } from "lucide-react";

interface EventCardDetailsProps {
  date: string;
  location: string;
}

export const EventCardDetails = ({ date, location }: EventCardDetailsProps) => {
  return (
    <>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <span className="mr-auto">{date}</span>
        <CalendarDays size={16} className="ml-2" />
      </div>
      <div className="flex items-center gap-2 text-gray-600 text-sm">
        <span className="mr-auto">{location}</span>
        <MapPin size={16} className="ml-2" />
      </div>
    </>
  );
};