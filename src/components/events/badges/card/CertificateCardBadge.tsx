import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";

interface CertificateCardBadgeProps {
  certificateType: string;
}

export const CertificateCardBadge = ({ certificateType }: CertificateCardBadgeProps) => {
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
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 border-[#6366F1] bg-[#EEF2FF] text-[#6366F1]"
    >
      <Award className="w-3 h-3" />
      {getCertificateLabel(certificateType)}
    </Badge>
  );
};