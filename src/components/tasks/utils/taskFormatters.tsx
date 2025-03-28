
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";

export const getStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case "pending":
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case "delayed":
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case "upcoming":
      return <Activity className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case "completed":
      return "مكتملة";
    case "pending":
      return "قيد التنفيذ";
    case "delayed":
      return "متأخرة";
    case "upcoming":
      return "قادمة";
    default:
      return "غير محددة";
  }
};

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "completed":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          مكتملة
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          قيد التنفيذ
        </Badge>
      );
    case "delayed":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          متأخرة
        </Badge>
      );
    case "upcoming":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          قادمة
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          غير محددة
        </Badge>
      );
  }
};

export const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">عالية</Badge>;
    case "medium":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">متوسطة</Badge>;
    case "low":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">منخفضة</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">غير محددة</Badge>;
  }
};

export const formatDueDate = (dateString: string | null) => {
  if (!dateString) return "لا يوجد موعد";

  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "تاريخ غير صالح";

    return format(date, "dd MMM yyyy", { locale: ar });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "خطأ في التاريخ";
  }
};
