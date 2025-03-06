
import { Badge } from "@/components/ui/badge";

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">أولوية عالية</Badge>;
    case "medium":
      return <Badge variant="secondary">أولوية متوسطة</Badge>;
    case "low":
    default:
      return <Badge variant="outline">أولوية منخفضة</Badge>;
  }
};
