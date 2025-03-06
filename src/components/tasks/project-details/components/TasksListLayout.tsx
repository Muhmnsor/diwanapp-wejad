
import { Task } from "../types/task";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface TasksListLayoutProps {
  tasks: Task[];
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TasksListLayout = ({
  tasks,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: TasksListLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <Card key={task.id} className="p-4 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-base line-clamp-2">{task.title}</h3>
            {getStatusBadge(task.status)}
          </div>
          
          <p className="text-gray-500 text-sm line-clamp-2 mb-3">
            {task.description || "لا يوجد وصف"}
          </p>
          
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex items-center gap-2">
              {getPriorityBadge(task.priority)}
              <span>تاريخ الاستحقاق: {formatDate(task.due_date)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Link to={`/tasks/task/${task.id}?projectId=${projectId}`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, "completed")}
                    disabled={task.status === "completed"}
                  >
                    تحديد كمكتملة
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, "in_progress")}
                    disabled={task.status === "in_progress"}
                  >
                    تحديد قيد التنفيذ
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onStatusChange(task.id, "pending")}
                    disabled={task.status === "pending"}
                  >
                    تحديد قيد الانتظار
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
