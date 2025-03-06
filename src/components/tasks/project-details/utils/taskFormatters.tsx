
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          مكتملة
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          قيد التنفيذ
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          ملغية
        </Badge>
      );
    case "delayed":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          متأخرة
        </Badge>
      );
    case "draft":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          مسودة
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          قيد الانتظار
        </Badge>
      );
  }
};

export const getPriorityBadge = (priority: string | null) => {
  if (!priority) return null;
  
  switch (priority) {
    case "high":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          عالية
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          متوسطة
        </Badge>
      );
    case "low":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          منخفضة
        </Badge>
      );
    default:
      return null;
  }
};

export const formatDate = (date: string | null) => {
  if (!date) return "غير محدد";
  
  try {
    return format(new Date(date), "d MMMM yyyy", { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "تاريخ غير صالح";
  }
};
