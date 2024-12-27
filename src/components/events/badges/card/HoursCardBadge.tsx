import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface HoursCardBadgeProps {
  hours?: number | null;
}

export const HoursCardBadge = ({ hours }: HoursCardBadgeProps) => {
  // تأكد من أن الساعات موجودة وأكبر من صفر
  if (!hours || hours <= 0) return null;

  return (
    <Badge 
      variant="outline" 
      className="flex items-center gap-1 border-[#EC4899] bg-[#FDF2F8] text-[#EC4899]"
    >
      <Clock className="w-3 h-3" />
      {hours} {hours === 1 ? 'ساعة' : 'ساعات'}
    </Badge>
  );
};