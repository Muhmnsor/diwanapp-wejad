import { Badge } from "@/components/ui/badge";

interface PriceCardBadgeProps {
  price: number | null;
}

export const PriceCardBadge = ({ price }: PriceCardBadgeProps) => {
  return (
    <Badge 
      variant={!price ? "secondary" : "default"}
      className={`${!price ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-[#F97316] border-[#F97316] text-white'} border`}
    >
      {!price ? "مجاني" : `${price} ريال`}
    </Badge>
  );
};