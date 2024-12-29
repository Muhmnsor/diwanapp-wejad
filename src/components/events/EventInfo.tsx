import { BeneficiaryCardBadge } from "./badges/card/BeneficiaryCardBadge";
import { CertificateCardBadge } from "./badges/card/CertificateCardBadge";
import { EventTypeCardBadge } from "./badges/card/EventTypeCardBadge";
import { HoursCardBadge } from "./badges/card/HoursCardBadge";
import { PriceCardBadge } from "./badges/card/PriceCardBadge";
import { MapPin, Calendar, Clock } from "lucide-react";
import { EventStatus } from "@/types/eventStatus";

interface EventInfoProps {
  date: string;
  time?: string;
  location: string;
  eventType: string;
  price: number | null;
  maxAttendees: number;
  currentAttendees: number;
  beneficiaryType: string;
  certificateType?: string;
  eventHours?: number | null;
  locationUrl?: string | null;
  status: EventStatus;
  isProject?: boolean;
}

export const EventInfo = ({
  date,
  time,
  location,
  eventType,
  price,
  maxAttendees,
  currentAttendees,
  beneficiaryType,
  certificateType = 'none',
  eventHours,
  locationUrl,
  isProject = false
}: EventInfoProps) => {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center gap-2 text-gray-600">
        <Calendar className="w-5 h-5" />
        <span>{date}</span>
      </div>
      
      {!isProject && time && (
        <div className="flex items-center gap-2 text-gray-600">
          <Clock className="w-5 h-5" />
          <span>{time}</span>
        </div>
      )}

      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-5 h-5" />
        {locationUrl ? (
          <a
            href={locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {location}
          </a>
        ) : (
          <span>{location}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-4">
        <EventTypeCardBadge type={eventType} />
        <BeneficiaryCardBadge type={beneficiaryType} />
        <PriceCardBadge price={price} />
        <CertificateCardBadge type={certificateType} />
        {eventHours && <HoursCardBadge hours={eventHours} />}
      </div>

      <div className="text-sm text-gray-600">
        عدد المقاعد: {currentAttendees}/{maxAttendees}
      </div>
    </div>
  );
};