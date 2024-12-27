import { EventInfo } from "../EventInfo";
import { EventBadges } from "../badges/EventBadges";

interface EventDetailsProps {
  date: string;
  time: string;
  location: string;
  location_url?: string;
  attendees: number;
  maxAttendees: number;
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: string;
  certificateType?: string;
  eventHours?: number;
  eventPath?: string;
  eventCategory?: string;
}

export const EventDetails = ({
  date,
  time,
  location,
  location_url,
  attendees,
  maxAttendees,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours,
  eventPath,
  eventCategory
}: EventDetailsProps) => {
  return (
    <div className="space-y-8">
      <EventBadges
        eventType={eventType}
        price={price}
        beneficiaryType={beneficiaryType}
        certificateType={certificateType}
        eventHours={eventHours}
      />
      <EventInfo
        date={date}
        time={time}
        location={location}
        location_url={location_url}
        attendees={attendees}
        maxAttendees={maxAttendees}
        eventType={eventType}
        price={price}
        beneficiaryType={beneficiaryType}
        certificateType={certificateType}
        eventHours={eventHours}
        eventPath={eventPath}
        eventCategory={eventCategory}
      />
    </div>
  );
};