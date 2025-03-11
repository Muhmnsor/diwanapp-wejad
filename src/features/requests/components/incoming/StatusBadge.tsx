
import { Badge } from "@/components/ui/badge";
import { getStatusClass, getStatusLabel } from "../../utils/requestFormatters";

interface RequestStatusBadgeProps {
  status: string;
}

export const RequestStatusBadge = ({ status }: RequestStatusBadgeProps) => {
  return (
    <Badge 
      variant="outline" 
      className={`whitespace-nowrap ${getStatusClass(status)}`}
    >
      {getStatusLabel(status)}
    </Badge>
  );
};
