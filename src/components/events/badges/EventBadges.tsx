import { Badge } from "@/components/ui/badge";
import { Award, Clock, Users } from "lucide-react";
import { BeneficiaryType } from "@/types/event";

interface EventBadgesProps {
  eventType: "online" | "in-person";
  price: number | "free";
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  eventHours?: number;
}

export const EventBadges = ({
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours
}: EventBadgesProps) => {
  console.log('EventBadges received:', {
    certificateType,
    eventHours
  });

  const getBeneficiaryLabel = (type: string) => {
    switch (type) {
      case 'men':
        return 'رجال';
      case 'women':
        return 'نساء';
      case 'children':
        return 'أطفال';
      case 'all':
        return 'الجميع';
      default:
        return 'رجال ونساء';
    }
  };

  const getCertificateLabel = (type: string | undefined) => {
    if (!type || type === 'none') return null;
    switch (type) {
      case 'attendance':
        return 'شهادة حضور';
      case 'certified':
        return 'شهادة معتمدة';
      default:
        return type;
    }
  };

  const shouldShowCertificate = certificateType && certificateType !== 'none';
  // Only show hours if certificate exists AND hours are greater than 0
  const shouldShowHours = shouldShowCertificate && eventHours && eventHours > 0;

  return (
    <div className="flex flex-wrap items-center gap-2 px-8 py-6">
      <Badge variant={eventType === "online" ? "secondary" : "default"} className="rounded-full px-4 py-1">
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>
      <Badge variant="outline" className="rounded-full px-4 py-1">
        {price === "free" ? "مجاني" : `${price} ريال`}
      </Badge>
      <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
        <Users className="w-4 h-4" />
        {getBeneficiaryLabel(beneficiaryType)}
      </Badge>
      {shouldShowCertificate && (
        <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
          <Award className="w-4 h-4" />
          {getCertificateLabel(certificateType)}
        </Badge>
      )}
      {shouldShowHours && (
        <Badge variant="outline" className="rounded-full px-4 py-1 flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {eventHours} {eventHours === 1 ? 'ساعة' : 'ساعات'} تدريبية
        </Badge>
      )}
    </div>
  );
};