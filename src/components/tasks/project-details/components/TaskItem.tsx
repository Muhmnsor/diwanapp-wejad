
import { Button } from "@/components/ui/button";
import { Task } from "../types/task";
import { TableCell, TableRow } from "@/components/ui/table";
import { CheckCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteTaskDialog } from "../../components/dialogs/DeleteTaskDialog";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask?: (taskId: string) => void;
  projectId: string;
}

export const TaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  onDeleteTask,
  projectId
}: TaskItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <TableRow>
        <TableCell className="font-medium">{task.title}</TableCell>
        <TableCell>{getStatusBadge(task.status || 'pending')}</TableCell>
        <TableCell>{getPriorityBadge(task.priority || null)}</TableCell>
        <TableCell>{task.assigned_user_name || '-'}</TableCell>
        <TableCell>{task.due_date ? formatDate(task.due_date) : '-'}</TableCell>
        <TableCell>
          <div className="flex gap-2 justify-end">
            {task.status !== 'completed' ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onStatusChange(task.id, 'completed')}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => onStatusChange(task.id, 'in_progress')}
              >
                <CheckCircle className="h-4 w-4 text-gray-300" />
              </Button>
            )}
            
            {onDeleteTask && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      
      {/* Delete Task Dialog */}
      <DeleteTaskDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        taskId={task.id}
        taskTitle={task.title}
        onSuccess={() => onDeleteTask?.(task.id)}
      />
    </>
  );
};
