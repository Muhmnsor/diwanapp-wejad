
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, Edit, Trash, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from "../types/task";
import { Button } from "@/components/ui/button";
import { useTaskModal } from "../hooks/useTaskModal";
import { toast } from "sonner";
import { useSubtasks } from "../hooks/useSubtasks";
import { SubtasksList } from "./subtasks/SubtasksList";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => Promise<void>;
  getStatusBadge?: (status: string) => JSX.Element;
  getPriorityBadge?: (priority: string | null) => JSX.Element | null;
  formatDate?: (date: string | null) => string;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export const TaskCard = ({ 
  task, 
  onDelete,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange
}: TaskCardProps) => {
  const { onOpen } = useTaskModal();
  const { 
    subtasks, 
    isLoading, 
    addSubtask, 
    updateSubtaskStatus, 
    deleteSubtask,
    refreshSubtasks 
  } = useSubtasks(task.id);
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);

  const handleEdit = () => {
    onOpen(task.id);
  };

  const handleDelete = async () => {
    try {
      await onDelete(task.id);
      toast.success("Task deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete task.");
    }
  };

  // Update the handleAddSubtask function to have the correct parameter signature
  const handleAddSubtask = async (title: string, dueDate: string, assignedTo: string) => {
    if (task) {
      try {
        await addSubtask(title, dueDate, assignedTo);
        // Refresh subtasks after adding
        refreshSubtasks();
      } catch (error) {
        console.error("Error adding subtask:", error);
      }
    }
  };

  const handleUpdateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    try {
      await updateSubtaskStatus(subtaskId, newStatus);
    } catch (error) {
      console.error("Error updating subtask status:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask(subtaskId);
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  return (
    <Card className="bg-card text-card-foreground shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:bg-destructive/20">
              <Trash className="h-4 w-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs text-muted-foreground">
          {task.description || "No description provided."}
        </CardDescription>
        <div className="flex items-center mt-4">
          {task.assigned_to ? (
            <Avatar className="mr-2 h-6 w-6">
              <AvatarImage src={`https://avatar.vercel.sh/${task.assigned_user_name}.png`} alt={task.assigned_user_name || "Assigned User"} />
              <AvatarFallback>{task.assigned_user_name?.substring(0, 2).toUpperCase() || 'UN'}</AvatarFallback>
            </Avatar>
          ) : (
            <User className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-xs text-gray-500">
            {task.assigned_user_name || "Unassigned"}
          </span>
        </div>
        {task.due_date && (
          <div className="flex items-center mt-2">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-gray-500">
              {formatDate ? formatDate(task.due_date) : new Date(task.due_date).toLocaleDateString()}
            </span>
          </div>
        )}
        <div className="mt-3">
          {task.priority && getPriorityBadge && getPriorityBadge(task.priority)}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline">
          {task.stage_name || "No Stage"}
        </Badge>
        {task.status === 'completed' ? (
          <div className="flex items-center text-green-500">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span>Completed</span>
          </div>
        ) : (
          <div className="flex items-center text-red-500">
            <XCircle className="mr-1 h-4 w-4" />
            <span>Pending</span>
          </div>
        )}
      </CardFooter>
      <SubtasksList
        taskId={task.id}
        projectId={task.project_id}
        subtasks={subtasks}
        onAddSubtask={handleAddSubtask}
        onUpdateSubtaskStatus={handleUpdateSubtaskStatus}
        onDeleteSubtask={handleDeleteSubtask}
      />
    </Card>
  );
};
