
import { Badge } from "@/components/ui/badge";

interface RequestPriorityBadgeProps {
  priority: string;
}

export const RequestPriorityBadge = ({ priority }: RequestPriorityBadgeProps) => {
  switch (priority) {
    case 'low':
      return <Badge variant="outline">منخفضة</Badge>;
    case 'medium':
      return <Badge variant="secondary">متوسطة</Badge>;
    case 'high':
      return <Badge variant="default">عالية</Badge>;
    case 'urgent':
      return <Badge variant="destructive">عاجلة</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};
