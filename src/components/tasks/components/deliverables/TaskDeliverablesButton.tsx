
import { Button } from "@/components/ui/button";
import { FileCheck } from "lucide-react";
import { useState } from "react";
import { TaskDeliverablesDialog } from "../dialogs/TaskDeliverablesDialog";
import { Task } from "../../types/task";

interface TaskDeliverablesButtonProps {
  taskId?: string | null;
  task?: Task;
  hideInTasksList?: boolean;
}

export const TaskDeliverablesButton = ({ taskId, task, hideInTasksList = false }: TaskDeliverablesButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // لو تم طلب إخفاء الزر في قائمة المهام، قم بإرجاع null (لا تعرض شيء)
  if (hideInTasksList) return null;
  
  if (!taskId && !task) return null;
  
  // إذا تم توفير taskId فقط، قم بإنشاء كائن task أساسي
  const taskToUse = task || {
    id: taskId as string,
    title: "المهمة",
    assigned_to: null,
    created_at: ""
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleOpenDialog}
        className="h-6 text-xs text-gray-500 hover:text-gray-700 task-deliverables-button"
      >
        <FileCheck className="h-3.5 w-3.5 mr-1" />
        المستلمات
      </Button>
      
      {dialogOpen && (
        <TaskDeliverablesDialog 
          task={taskToUse} 
          open={dialogOpen} 
          onOpenChange={setDialogOpen} 
        />
      )}
    </>
  );
};
