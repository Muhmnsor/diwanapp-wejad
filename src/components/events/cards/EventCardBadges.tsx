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
  const shouldShowHours = shouldShowCertificate && eventHours && eventHours > 0;

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      <Badge 
        variant={eventType === "online" ? "secondary" : "default"}
        className={`${eventType === "online" ? 'bg-secondary border-[#6E59A5] text-[#1A1F2C]' : 'bg-primary/10 border-primary text-primary'} border`}
      >
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>
      <Badge 
        variant={!price ? "secondary" : "default"}
        className={`${!price ? 'bg-[#E5DEFF] border-[#6E59A5] text-[#1A1F2C]' : 'bg-accent/10 border-accent text-accent'} border`}
      >
        {!price ? "مجاني" : `${price} ريال`}
      </Badge>
      <Badge 
        variant="outline" 
        className="border-[#403E43] bg-[#F5F5F7] text-[#403E43]"
      >
        {getBeneficiaryLabel(beneficiaryType)}
      </Badge>
      {shouldShowCertificate && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 border-[#8E9196] bg-[#F1F1F1] text-[#403E43]"
        >
          <Award className="w-3 h-3" />
          {getCertificateLabel(certificateType)}
        </Badge>
      )}
      {shouldShowHours && eventHours > 0 && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 border-[#8E9196] bg-[#F1F1F1] text-[#403E43]"
        >
          <Clock className="w-3 h-3" />
          {eventHours} {eventHours === 1 ? 'ساعة' : 'ساعات'}
        </Badge>
      )}
    </div>
  );
};