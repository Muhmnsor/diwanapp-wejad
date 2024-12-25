import { Badge } from "@/components/ui/badge";
import { Award, Clock } from "lucide-react";

interface EventCardBadgesProps {
  eventType: "online" | "in-person";
  price: number | null;
  beneficiaryType: string;
  certificateType?: string;
  eventHours?: number;
}

export const EventCardBadges = ({
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours
}: EventCardBadgesProps) => {
  console.log('EventCardBadges received:', {
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

  const getCertificateLabel = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'شهادة حضور';
      case 'certified':
        return 'شهادة معتمدة';
      default:
        return '';
    }
  };

  const shouldShowCertificate = certificateType && certificateType !== 'none';
  const shouldShowHours = shouldShowCertificate && eventHours && eventHours > 1;

  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant={eventType === "online" ? "secondary" : "default"}>
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>
      <Badge variant={!price ? "secondary" : "default"}>
        {!price ? "مجاني" : `${price} ريال`}
      </Badge>
      <Badge variant="outline" className="text-primary">
        {getBeneficiaryLabel(beneficiaryType)}
      </Badge>
      {shouldShowCertificate && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Award className="w-3 h-3" />
          {getCertificateLabel(certificateType)}
        </Badge>
      )}
      {shouldShowHours && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {eventHours} {eventHours === 1 ? 'ساعة' : 'ساعات'}
        </Badge>
      )}
    </div>
  );
};