
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  ClipboardList, 
  AlertTriangle,
  Clock as ClockIcon
} from "lucide-react";

interface ProjectStatusBadgeProps {
  status: string;
}

export const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> مكتمل</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد التنفيذ</Badge>;
    case 'pending':
      return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    case 'delayed':
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> متعثر</Badge>;
    case 'stopped':
      return <Badge variant="outline" className="flex items-center gap-1 border-red-500 text-red-500"><ClockIcon className="h-3 w-3" /> متوقف</Badge>;
    default:
      return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
  }
};
