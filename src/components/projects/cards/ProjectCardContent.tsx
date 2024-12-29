import { CalendarDays, MapPin, Users } from "lucide-react";
import { ProjectTypeCardBadge } from "./badges/ProjectTypeCardBadge";
import { PriceCardBadge } from "./badges/PriceCardBadge";
import { BeneficiaryCardBadge } from "./badges/BeneficiaryCardBadge";
import { CertificateCardBadge } from "./badges/CertificateCardBadge";
import { formatDate } from "@/utils/dateUtils";

interface ProjectCardContentProps {
  startDate: string;
  endDate: string;
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  maxAttendees?: number;
  status: {
    text: string;
    variant: "destructive" | "secondary";
    color: string;
    textColor: string;
  };
}

export const ProjectCardContent = ({
  startDate,
  endDate,
  eventType,
  price,
  beneficiaryType,
  certificateType = "none",
  maxAttendees = 0,
  status,
}: ProjectCardContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarDays className="w-4 h-4" />
        <span className="text-sm">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
      </div>

      {eventType === "in-person" && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">حضوري</span>
        </div>
      )}

      {maxAttendees > 0 && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span className="text-sm">{maxAttendees} مقعد</span>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ProjectTypeCardBadge type={eventType} />
        {price !== null && <PriceCardBadge price={price} />}
        <BeneficiaryCardBadge type={beneficiaryType} />
        {certificateType !== "none" && (
          <CertificateCardBadge type={certificateType} />
        )}
      </div>
    </div>
  );
};