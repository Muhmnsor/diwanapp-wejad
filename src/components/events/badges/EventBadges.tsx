import { Badge } from "@/components/ui/badge";
import { Award, Clock } from "lucide-react";
import { BeneficiaryType } from "@/types/event";

interface EventBadgesProps {
  eventType: "online" | "in-person";
  price: number | "free" | null;
  beneficiaryType: BeneficiaryType;
  certificateType?: string;
  eventHours?: number | null;
}

export const EventBadges = ({
  eventType,
  price,
  beneficiaryType,
  certificateType,
  eventHours
}: EventBadgesProps) => {
  console.log('EventBadges received:', {
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
    <div className="flex flex-wrap gap-3 items-center px-8 pointer-events-none">
      <Badge 
        variant={eventType === "online" ? "secondary" : "default"}
        className={`${eventType === "online" ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'bg-[#0EA5E9] border-[#0EA5E9] text-white'} border`}
      >
        {eventType === "online" ? "عن بعد" : "حضوري"}
      </Badge>
      
      <Badge 
        variant={!price || price === "free" ? "secondary" : "default"}
        className={`${!price || price === "free" ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-[#F97316] border-[#F97316] text-white'} border`}
      >
        {!price || price === "free" ? "مجاني" : `${price} ريال`}
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