import { CalendarDays, Users } from "lucide-react";
import { BeneficiaryCardBadge } from "@/components/events/badges/card/BeneficiaryCardBadge";
import { CertificateCardBadge } from "@/components/events/badges/card/CertificateCardBadge";
import { EventTypeCardBadge } from "@/components/events/badges/card/EventTypeCardBadge";
import { PriceCardBadge } from "@/components/events/badges/card/PriceCardBadge";

interface ProjectCardContentProps {
  startDate: string;
  endDate: string;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  maxAttendees?: number;
  eventPath?: string;
  eventCategory?: string;
}

export const ProjectCardContent = ({
  startDate,
  endDate,
  eventType,
  price,
  beneficiaryType,
  certificateType,
  maxAttendees = 0,
  eventPath,
  eventCategory
}: ProjectCardContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <EventTypeCardBadge eventType={eventType} />
        <PriceCardBadge price={price} />
        <BeneficiaryCardBadge beneficiaryType={beneficiaryType} />
        {certificateType && certificateType !== 'none' && (
          <CertificateCardBadge certificateType={certificateType} />
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>من: {startDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4" />
          <span>إلى: {endDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          <span>عدد المقاعد: {maxAttendees}</span>
        </div>
      </div>
    </div>
  );
};