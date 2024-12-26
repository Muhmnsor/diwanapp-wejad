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
    eventType,
    price,
    beneficiaryType,
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
        return 'الجميع';
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
    <div className="flex flex-wrap gap-2">
      <Badge 
        variant={eventType === "online" ? "secondary" : "default"}
        className={`${eventType === "online" ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'bg-[#0EA5E9] border-[#0EA5E9] text-white'} border`}
      >
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>
      
      <Badge 
        variant={!price ? "secondary" : "default"}
        className={`${!price ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-[#F97316] border-[#F97316] text-white'} border`}
      >
        {!price ? "مجاني" : `${price} ريال`}
      </Badge>
      
      <Badge 
        variant="outline" 
        className="border-[#D946EF] bg-[#FDF4FF] text-[#D946EF]"
      >
        {getBeneficiaryLabel(beneficiaryType)}
      </Badge>
      
      {shouldShowCertificate && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
        >
          <Award className="w-3 h-3" />
          {getCertificateLabel(certificateType)}
        </Badge>
      )}
      
      {shouldShowHours && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 border-[#EC4899] bg-[#FDF2F8] text-[#EC4899]"
        >
          <Clock className="w-3 h-3" />
          {eventHours} {eventHours === 1 ? 'ساعة' : 'ساعات'}
        </Badge>
      )}
    </div>
  );
};