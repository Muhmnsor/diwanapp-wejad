
import React from "react";
import { formatDate as formatDateUtility } from "@/utils/formatters";

// Format status as a visual badge
export const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <div className="flex items-center gap-1 text-green-500 font-medium"><span className="w-2 h-2 rounded-full bg-green-500"></span> مكتمل</div>;
    case 'in_progress':
      return <div className="flex items-center gap-1 text-amber-500 font-medium"><span className="w-2 h-2 rounded-full bg-amber-500"></span> قيد التنفيذ</div>;
    case 'pending':
      return <div className="flex items-center gap-1 text-blue-500 font-medium"><span className="w-2 h-2 rounded-full bg-blue-500"></span> قيد الانتظار</div>;
    case 'delayed':
      return <div className="flex items-center gap-1 text-red-500 font-medium"><span className="w-2 h-2 rounded-full bg-red-500"></span> متأخرة</div>;
    case 'cancelled':
      return <div className="flex items-center gap-1 text-gray-500 font-medium"><span className="w-2 h-2 rounded-full bg-gray-500"></span> ملغية</div>;
    default:
      return <div className="flex items-center gap-1 text-gray-500 font-medium"><span className="w-2 h-2 rounded-full bg-gray-500"></span> غير محدد</div>;
  }
};

// Format priority as a visual badge
export const getPriorityBadge = (priority: string | null) => {
  if (!priority) return null;
  
  switch (priority) {
    case 'high':
      return <div className="text-red-500">عالية</div>;
    case 'medium':
      return <div className="text-amber-500">متوسطة</div>;
    case 'low':
      return <div className="text-green-500">منخفضة</div>;
    default:
      return null;
  }
};

// Format dates in Gregorian format
export const formatDate = (date: string | null) => {
  if (!date) return "غير محدد";
  
  try {
    return formatDateUtility(date, "غير محدد");
  } catch (e) {
    return "تاريخ غير صالح";
  }
};
