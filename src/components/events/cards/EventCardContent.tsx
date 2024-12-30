import { EventCardBadges } from "./EventCardBadges";
import { EventCardDetails } from "./EventCardDetails";
import { EventCardStatus } from "./EventCardStatus";
import { Users } from "lucide-react";

interface EventCardContentProps {
  date: string;
  location: string;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  eventHours?: number;
  maxAttendees?: number;
  status: {
    text: string;
    variant: "default" | "secondary" | "destructive" | "accent";
    color: string;
    textColor: string;
  };
}

export const EventCardContent = ({
  date,
  location,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours,
  maxAttendees,
  status
}: EventCardContentProps) => {
  return (
    <div className="space-y-3 p-4 pt-0">
      <EventCardBadges
        eventType={eventType}
        price={price}
        beneficiaryType={beneficiaryType}
        certificateType={certificateType}
        eventHours={eventHours}
      />
      <EventCardDetails
        date={date}
        location={location}
      />
      {maxAttendees > 0 && (
        <>
          <div className="flex items-center gap-2 text-gray-600 text-sm justify-end">
            <span>{maxAttendees} مقعد</span>
            <Users className="w-4 h-4" />
          </div>
          <EventCardStatus
            maxAttendees={maxAttendees}
            status={status}
          />
        </>
      )}
    </div>
  );
};