import { Badge } from "@/components/ui/badge";

interface PriceCardBadgeProps {
  price: number;
}

export const PriceCardBadge = ({ price }: PriceCardBadgeProps) => {
  return (
    <Badge variant="secondary" className="rounded-md">
      {price === 0 ? "مجاني" : `${price} ريال`}
    </Badge>
  );
};