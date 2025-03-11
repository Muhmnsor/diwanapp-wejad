
import { Badge } from "@/components/ui/badge";
import { getPriorityClass, getPriorityLabel } from "../../utils/requestFormatters";

interface RequestPriorityBadgeProps {
  priority: string;
}

export const RequestPriorityBadge = ({ priority }: RequestPriorityBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`whitespace-nowrap ${getPriorityClass(priority)}`}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );
};
