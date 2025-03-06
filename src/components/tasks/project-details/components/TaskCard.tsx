
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Clock, User, Calendar, Trash2 } from "lucide-react";
import { Task } from "../types/task";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { DeleteTaskDialog } from "../../components/dialogs/DeleteTaskDialog";

interface TaskCardProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId: string;
}

export const TaskCard = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  onDeleteTask,
  projectId
}: TaskCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800 mb-2">{task.title}</h4>
            
            <div className="flex gap-2 mb-3">
              {getStatusBadge(task.status || 'pending')}
              {getPriorityBadge(task.priority || null)}
            </div>
            
            <div className="text-sm text-muted-foreground">
              {task.description && (
                <p className="mb-2 line-clamp-2">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-3 mt-3">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}
                
                {task.assigned_user_name && (
                  <div className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                    <span>{task.assigned_user_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {task.status !== 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'completed')}>
                  تعليم كمكتمل
                </DropdownMenuItem>
              )}
              {task.status === 'completed' && (
                <DropdownMenuItem onClick={() => onStatusChange(task.id, 'in_progress')}>
                  تعليم كقيد التنفيذ
                </DropdownMenuItem>
              )}
              {onDeleteTask && (
                <DropdownMenuItem 
                  className="text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                  حذف المهمة
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onSuccess={() => onDeleteTask?.(task.id)}
      />
    </Card>
  );
};
