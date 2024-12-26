import { Badge } from "@/components/ui/badge";

interface BeneficiaryCardBadgeProps {
  beneficiaryType: string;
}

export const BeneficiaryCardBadge = ({ beneficiaryType }: BeneficiaryCardBadgeProps) => {
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

  return (
    <Badge 
      variant="outline" 
      className="border-[#D946EF] bg-[#FDF4FF] text-[#D946EF]"
    >
      {getBeneficiaryLabel(beneficiaryType)}
    </Badge>
  );
};