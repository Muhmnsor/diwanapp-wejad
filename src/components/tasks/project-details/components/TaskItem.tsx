
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  AlertCircle,
  Clock,
  User 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMemo } from "react";
import { formatDate } from "../utils/taskFormatters";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PriorityBadge } from "./PriorityBadge";
import { StatusBadge } from "./StatusBadge";

interface TaskItemProps {
  task: Task;
  onStatusChange?: (taskId: string, newStatus: string) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const TaskItem = ({ 
  task, 
  onStatusChange, 
  onEditTask,
  onDeleteTask 
}: TaskItemProps) => {
  const statusOptions = useMemo(() => [
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتملة" },
    { value: "delayed", label: "متأخرة" },
  ], []);

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
    }
  };

  return (
    <div className="p-4 border rounded-lg mb-2 bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{task.title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={task.status} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0" aria-label="المزيد من الخيارات">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => onEditTask && onEditTask(task)}>
                <Pencil className="h-4 w-4 ml-2" />
                تعديل
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onSelect={() => onDeleteTask && onDeleteTask(task.id)}
                className="text-red-600"
              >
                <Trash className="h-4 w-4 ml-2" />
                حذف
              </DropdownMenuItem>
              
              {statusOptions.map(option => (
                <DropdownMenuItem 
                  key={option.value} 
                  onSelect={() => handleStatusChange(option.value)}
                  disabled={task.status === option.value}
                >
                  <span className="ml-2">تغيير الحالة إلى:</span> {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}
      
      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
        {task.priority && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  <PriorityBadge priority={task.priority} />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>أولوية المهمة</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {task.due_date && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 ml-1" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>تاريخ الاستحقاق</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        {task.assigned_user_name && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <User className="h-4 w-4 ml-1" />
                  <span>{task.assigned_user_name}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>مسند إلى</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
