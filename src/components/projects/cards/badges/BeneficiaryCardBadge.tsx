import { Badge } from "@/components/ui/badge";

interface BeneficiaryCardBadgeProps {
  type: string;
}

export const BeneficiaryCardBadge = ({ type }: BeneficiaryCardBadgeProps) => {
  const getBeneficiaryText = (type: string) => {
    switch (type) {
      case "male":
        return "رجال";
      case "female":
        return "نساء";
      default:
        return "الجميع";
    }
  };

  return (
    <Badge variant="secondary" className="rounded-md">
      {getBeneficiaryText(type)}
    </Badge>
  );
};