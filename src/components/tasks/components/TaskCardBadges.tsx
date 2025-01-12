import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TaskCardBadgesProps {
  status: string;
  asanaGid: string | null;
  onSync?: () => void;
}

export const TaskCardBadges = ({ status, asanaGid, onSync }: TaskCardBadgesProps) => {
  const getStatusText = () => {
    switch (status) {
      case "completed":
        return "مكتمل";
      case "in_progress":
        return "قيد التنفيذ";
      default:
        return "معلق";
    }
  };

  const getStatusClassName = () => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center gap-2">
      {asanaGid && (
        <Badge 
          variant="outline" 
          className="bg-purple-100 text-purple-800 cursor-pointer"
          onClick={onSync}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Asana
        </Badge>
      )}
      <Badge
        variant="outline"
        className={getStatusClassName()}
      >
        {getStatusText()}
      </Badge>
    </div>
  );
};