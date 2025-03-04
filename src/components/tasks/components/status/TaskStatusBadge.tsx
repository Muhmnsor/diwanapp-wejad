
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
      return "bg-green-100 text-green-800 border-green-300";
    case "delayed":
      return "bg-red-100 text-red-800 border-red-300";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    case "upcoming":
      return "bg-blue-100 text-blue-800 border-blue-300";
    default:
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
  }
};

export const TaskStatusBadge = ({ status, dueDate }: TaskStatusBadgeProps) => {
  const currentStatus = getTaskStatus(status, dueDate);
  
  return (
    <div className={`text-xs ${getStatusVariant(currentStatus)}`}>
      {getStatusText(currentStatus)}
    </div>
  );
};
