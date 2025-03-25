
import { Activity, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, isValid, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskStatusBadge, TaskStatus } from "./taskStatusBadge";

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
    case "in_progress":
      return "جارية";
    case "cancelled":
      return "ملغية";
    default:
      return "غير محددة";
  }
};

export const getStatusBadge = (status: string) => {
  return <TaskStatusBadge status={status as TaskStatus} />;
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

export const formatDate = (dateString: string | null | undefined) => {
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
