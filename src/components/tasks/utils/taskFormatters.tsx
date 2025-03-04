
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock,
  AlertCircle,
  Calendar,
  XCircle
} from "lucide-react";
import { TaskStatus } from "../hooks/useAssignedTasks";

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">عالية</Badge>;
    case 'medium':
      return <Badge variant="default">متوسطة</Badge>;
    case 'low':
      return <Badge variant="outline">منخفضة</Badge>;
    default:
      return <Badge variant="outline">منخفضة</Badge>;
  }
};

export const formatDueDate = (date: string | null) => {
  if (!date) return 'غير محدد';
  try {
    return format(new Date(date), 'dd MMM yyyy', { locale: ar });
  } catch (error) {
    return 'تاريخ غير صالح';
  }
};

export const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-blue-500" />;
    case 'delayed':
      return <AlertCircle className="h-4 w-4 text-amber-500" />;
    case 'upcoming':
      return <Calendar className="h-4 w-4 text-purple-500" />;
    default:
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
};

export const getStatusText = (status: TaskStatus) => {
  switch (status) {
    case 'completed':
      return 'مكتملة';
    case 'pending':
      return 'قيد التنفيذ';
    case 'delayed':
      return 'متأخرة';
    case 'upcoming':
      return 'قادمة';
    default:
      return status;
  }
};
