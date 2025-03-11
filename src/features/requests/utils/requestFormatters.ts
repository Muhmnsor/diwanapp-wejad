
import { format } from "date-fns";

/**
 * Format date to display in the UI
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";
  return format(new Date(dateString), "yyyy-MM-dd");
};

/**
 * Get appropriate CSS class based on request status
 */
export const getStatusClass = (status: string): string => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800 border-green-300";
    case "rejected":
      return "bg-red-100 text-red-800 border-red-300";
    case "in_progress":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

/**
 * Get appropriate CSS class based on priority
 */
export const getPriorityClass = (priority: string): string => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

/**
 * Translate status to Arabic
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case "approved":
      return "تمت الموافقة";
    case "rejected":
      return "مرفوض";
    case "in_progress":
      return "قيد التنفيذ";
    case "pending":
      return "معلق";
    default:
      return status;
  }
};

/**
 * Translate priority to Arabic
 */
export const getPriorityLabel = (priority: string): string => {
  switch (priority) {
    case "high":
      return "عالية";
    case "medium":
      return "متوسطة";
    case "low":
      return "منخفضة";
    default:
      return priority;
  }
};

/**
 * Get the appropriate label for step type
 */
export const getStepTypeLabel = (stepType?: string): string => {
  if (!stepType) return "غير محدد";
  
  switch (stepType) {
    case "approval":
      return "موافقة";
    case "decision":
      return "قرار";
    case "review":
      return "مراجعة";
    case "notification":
      return "إشعار";
    default:
      return stepType;
  }
};

/**
 * Get CSS class for step type badge
 */
export const getStepTypeBadgeClass = (stepType?: string): string => {
  if (!stepType) return "bg-gray-50 text-gray-600 border-gray-200";
  
  switch (stepType) {
    case "approval":
      return "bg-green-50 text-green-600 border-green-200";
    case "decision":
      return "bg-blue-50 text-blue-600 border-blue-200";
    case "review":
      return "bg-amber-50 text-amber-600 border-amber-200";
    case "notification":
      return "bg-purple-50 text-purple-600 border-purple-200";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200";
  }
};
