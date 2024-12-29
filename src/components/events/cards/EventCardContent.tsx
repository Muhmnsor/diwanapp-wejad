import { CalendarIcon, MapPin, Users } from "lucide-react";
import { EventTypeCardBadge } from "../badges/card/EventTypeCardBadge";
import { BeneficiaryCardBadge } from "../badges/card/BeneficiaryCardBadge";
import { PriceCardBadge } from "../badges/card/PriceCardBadge";
import { CertificateCardBadge } from "../badges/card/CertificateCardBadge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface ProjectCardContentProps {
  date: string;
  endDate?: string;
  location?: string;
  price: number | null;
  beneficiaryType: string;
  certificateType: string;
  maxAttendees: number;
  status: {
    badge?: {
      text: string;
      className: string;
    };
  };
  isProject?: boolean;
}

export const EventCardContent = ({
  date,
  endDate,
  location,
  price,
  beneficiaryType,
  certificateType,
  maxAttendees,
  status,
  isProject = false
}: ProjectCardContentProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "dd MMMM yyyy", { locale: ar });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <CalendarIcon className="w-4 h-4" />
        <span>
          {isProject ? (
            <>
              {formatDate(date)} - {formatDate(endDate || date)}
            </>
          ) : (
            formatDate(date)
          )}
        </span>
      </div>
      {location && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      )}
      <div className="flex items-center gap-2 text-sm">
        <Users className="w-4 h-4" />
        <span>{maxAttendees} مقعد</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <BeneficiaryCardBadge beneficiaryType={beneficiaryType} />
        <PriceCardBadge price={price} />
        {certificateType !== 'none' && (
          <CertificateCardBadge certificateType={certificateType} />
        )}
      </div>
      {status.badge && (
        <div className="mt-2">
          <span className={`inline-block px-2 py-1 text-xs rounded ${status.badge.className}`}>
            {status.badge.text}
          </span>
        </div>
      )}
    </div>
  );
};