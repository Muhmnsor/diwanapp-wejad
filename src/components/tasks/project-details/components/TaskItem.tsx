import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, MessageSquare, CheckCircle, Trash2, XCircle } from "lucide-react";
import { Task } from "../types/task";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useSubtasks } from "../hooks/useSubtasks";
import { SubtasksList } from "./subtasks/SubtasksList";
import { AddSubtaskForm } from "./subtasks/AddSubtaskForm";

interface TaskItemProps {
  task: Task;
  projectId: string;
}

export const TaskItem = ({ task, projectId }: TaskItemProps) => {
  const [open, setOpen] = useState(false);
  const { subtasks, isLoading, addSubtask, updateSubtaskStatus, deleteSubtask, refreshSubtasks } = useSubtasks(task.id);

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

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{task.title}</CardTitle>
          <Badge variant="secondary">{task.status}</Badge>
        </div>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{task.assigned_user_name || 'Unassigned'}</p>
            <p className="text-sm text-muted-foreground">
              {task.assigned_to}
            </p>
          </div>
        </div>

        <SubtasksList 
          taskId={task.id}
          projectId={projectId}
          subtasks={subtasks}
          onAddSubtask={handleAddSubtask}
          onUpdateSubtaskStatus={updateSubtaskStatus}
          onDeleteSubtask={deleteSubtask}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost">
          <Edit className="w-4 h-4 mr-2" />
          تعديل
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              حذف
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>هل أنت متأكد تماما؟</AlertDialogTitle>
              <AlertDialogDescription>
                سيؤدي هذا الإجراء إلى حذف مهمتك بشكل دائم.
                <br />
                هل أنت متأكد؟
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
};
