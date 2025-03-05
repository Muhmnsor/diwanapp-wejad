
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { useState } from "react";
import { TaskDeliverablesDialog } from "../dialogs/TaskDeliverablesDialog";
import { Task } from "../../types/task";  // Using the correct Task type

interface TaskDeliverablesButtonProps {
  taskId?: string | null;
  task?: Task;
}

export const TaskDeliverablesButton = ({ taskId, task }: TaskDeliverablesButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  if (!taskId && !task) return null;
  
  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleOpenDialog}
        className="h-6 text-xs text-gray-500 hover:text-gray-700"
      >
        <FileCheck className="h-3.5 w-3.5 mr-1" />
        المستلمات
      </Button>
      
      {task && dialogOpen && (
        <TaskDeliverablesDialog 
          task={{
            id: task.id,
            title: task.title,
            description: task.description || null,
            status: task.status || "",
            due_date: task.due_date || null,
            assigned_to: task.assigned_to || null,
            priority: task.priority || null,
            created_at: task.created_at || "",
            stage_id: null,  // Adding the missing required property
            stage_name: undefined
          }} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      )}
    </>
  );
};
