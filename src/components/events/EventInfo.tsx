import { EventBadges } from "./badges/EventBadges";
import { EventDetails } from "./details/EventDetails";
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
  showBadges?: boolean;
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
  eventHours,
  showBadges = true
}: EventInfoProps) => {
  console.log('EventInfo received props:', {
    certificateType,
    eventHours,
    eventType,
    price,
    beneficiaryType
  });

  return (
    <div className="space-y-8">
      {showBadges && (
        <EventBadges
          eventType={eventType}
          price={price}
          beneficiaryType={beneficiaryType}
          certificateType={certificateType}
          eventHours={eventHours}
        />
      )}
      
      <EventDetails
        date={date}
        time={time}
        location={location}
        eventType={eventType}
        attendees={attendees}
        maxAttendees={maxAttendees}
      />
    </div>
  );
};