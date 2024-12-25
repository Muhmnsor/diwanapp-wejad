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
  console.log('EventInfo received props:', {
    certificateType,
    eventHours
  });

  return (
    <div className="space-y-8 mb-12">
      <EventBadges
        eventType={eventType}
        price={price}
        beneficiaryType={beneficiaryType}
        certificateType={certificateType}
        eventHours={eventHours}
      />
      
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