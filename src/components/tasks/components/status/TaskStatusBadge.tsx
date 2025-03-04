
import { Task } from "../../types/task";

interface TaskStatusBadgeProps {
  status: string;
  dueDate?: string | null;
}

export const getTaskStatus = (status: string, dueDate?: string | null) => {
  if (status === "completed") return "completed";
  
  if (dueDate) {
    const dueDateObj = new Date(dueDate);
    const now = new Date();
    
    if (dueDateObj < now) {
      return "delayed";
    }
  }
  
  return status;
};

export const getStatusText = (taskStatus: string) => {
  switch (taskStatus) {
    case "completed":
      return "مكتملة";
    case "delayed":
      return "متأخرة";
    case "pending":
      return "قيد التنفيذ";
    default:
      return "قيد التنفيذ";
  }
};

export const getStatusVariant = (taskStatus: string) => {
  switch (taskStatus) {
    case "completed":
      return "bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded-md";
    case "delayed":
      return "bg-red-100 text-red-800 border border-red-300 px-2 py-1 rounded-md";
    case "pending":
      return "bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-md";
    case "upcoming":
      return "bg-blue-100 text-blue-800 border border-blue-300 px-2 py-1 rounded-md";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300 px-2 py-1 rounded-md";
  }
};

export const TaskStatusBadge = ({ status, dueDate }: TaskStatusBadgeProps) => {
  const currentStatus = getTaskStatus(status, dueDate);
  
  return (
    <div className={`text-xs inline-block ${getStatusVariant(currentStatus)}`}>
      {getStatusText(currentStatus)}
    </div>
  );
};
