
import { Calendar, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Task } from "../TasksList";

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
}

export const TaskCard = ({ 
  task, 
  getStatusBadge, 
  getPriorityBadge, 
  formatDate 
}: TaskCardProps) => {
  return (
    <div className="border rounded-md p-4 hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{task.title}</h3>
        <div className="flex items-center gap-2">
          {getPriorityBadge(task.priority)}
          {getStatusBadge(task.status)}
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(task.due_date)}</span>
        </div>
        
        {task.assigned_user_name && (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>المكلف: {task.assigned_user_name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
