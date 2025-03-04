
import { useState } from "react";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { MessageCircle, MoreHorizontal } from "lucide-react";
import { TaskPriorityBadge } from "./priority/TaskPriorityBadge";
import { TaskStatusBadge } from "./status/TaskStatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TaskDetailPopover } from "./TaskDetailPopover";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";
import { formatDate } from "@/utils/dateUtils";

interface TaskTableRowProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskTableRow = ({ task, onStatusChange, onDelete }: TaskTableRowProps) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  
  const handleStatusChange = (status: string) => {
    onStatusChange(task.id, status);
  };
  
  const formattedDueDate = task.due_date 
    ? formatDate(new Date(task.due_date))
    : 'غير محدد';
  
  const workspaceName = task.workspace_name || 'مساحة العمل';
  const projectName = task.project_name || 'المشروع';
  
  return (
    <>
      <tr className="border-b hover:bg-muted/30">
        <td className="py-3 px-4">
          {task.title}
        </td>
        <td className="py-3 px-4 hidden md:table-cell">
          <TaskDetailPopover task={task} />
        </td>
        <td className="py-3 px-4 hidden lg:table-cell">
          {formattedDueDate}
        </td>
        <td className="py-3 px-4 hidden lg:table-cell">
          {projectName}
        </td>
        <td className="py-3 px-4">
          <TaskStatusBadge status={task.status || 'pending'} />
        </td>
        <td className="py-3 px-4 hidden md:table-cell">
          <TaskPriorityBadge priority={task.priority || 'medium'} />
        </td>
        <td className="py-3 px-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowDiscussion(true)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                  تعيين كمنجزة
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                  تعيين قيد التنفيذ
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('delayed')}>
                  تعيين كمتأخرة
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500"
                    onClick={() => onDelete(task.id)}
                  >
                    حذف
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </td>
      </tr>
      
      <TaskDiscussionDialog
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        task={task}
      />
    </>
  );
};
