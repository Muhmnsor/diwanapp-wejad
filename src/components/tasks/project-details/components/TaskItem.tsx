import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/types/workspace";
import { EditTaskDialog } from "../EditTaskDialog";
import { DeleteTaskDialog } from "../DeleteTaskDialog";
import { TaskDependenciesBadge } from "./TaskDependenciesBadge";

interface TaskItemProps {
  task: Task;
  projectId: string;
  projectStages: { id: string; name: string }[];
  projectMembers: { id: string; user_email: string }[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const TaskItem = ({ 
  task,
  projectId,
  projectStages,
  projectMembers,
  onStatusChange,
  onDelete,
  onTaskUpdated
}: TaskItemProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleStatusChange = (newStatus: string) => {
    onStatusChange(task.id, newStatus);
  };
  
  return (
    <div
      key={task.id}
      className="bg-white rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 font-medium">
          <span>{task.title}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <TaskDependenciesBadge taskId={task.id} />
          
          {task.status && (
            <Badge variant="secondary">
              {task.status}
            </Badge>
          )}
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mb-4">{task.description}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.priority && (
            <Badge variant="outline">
              {task.priority}
            </Badge>
          )}
          {task.due_date && (
            <span className="text-xs text-gray-400">
              Due: {new Date(task.due_date).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 rounded-md hover:bg-gray-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
              <Edit className="h-4 w-4 mr-2" />
              تعديل
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <EditTaskDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        task={task}
        projectId={projectId}
        projectStages={projectStages}
        projectMembers={projectMembers}
        onStatusChange={handleStatusChange}
        onTaskUpdated={onTaskUpdated}
      />
      
      <DeleteTaskDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        taskId={task.id}
        taskTitle={task.title}
        onDelete={onDelete}
      />
    </div>
  );
};
