
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { useState } from "react";
import { TaskDeliverablesDialog } from "../dialogs/TaskDeliverablesDialog";
import { Task } from "../../types/task";

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
          task={task} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      )}
    </>
  );
};
