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
      {certificateType && certificateType !== 'none' && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Award className="w-3 h-3" />
          {getCertificateLabel(certificateType)}
        </Badge>
      )}
      {eventHours && eventHours > 0 && (
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {eventHours} ساعات
        </Badge>
      )}
    </div>
  );
};