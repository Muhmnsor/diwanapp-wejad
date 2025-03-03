
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ClipboardList, AlertTriangle } from "lucide-react";
import { formatDate } from "@/utils/formatters";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="default" className="flex items-center gap-1 bg-green-500"><CheckCircle2 className="h-3 w-3" /> مكتمل</Badge>;
    case 'in_progress':
      return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> قيد التنفيذ</Badge>;
    case 'pending':
      return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
    case 'delayed':
      return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> متعثر</Badge>;
    default:
      return <Badge variant="outline" className="flex items-center gap-1"><ClipboardList className="h-3 w-3" /> قيد الانتظار</Badge>;
  }
};

export const getPriorityBadge = (priority: string | null) => {
  if (!priority) return null;
  
  switch (priority) {
    case 'high':
      return <Badge variant="outline" className="border-red-500 text-red-500">عالية</Badge>;
    case 'medium':
      return <Badge variant="outline" className="border-amber-500 text-amber-500">متوسطة</Badge>;
    case 'low':
      return <Badge variant="outline" className="border-green-500 text-green-500">منخفضة</Badge>;
    default:
      return null;
  }
};

// Use the new utility function for formatting dates
export { formatDate };
