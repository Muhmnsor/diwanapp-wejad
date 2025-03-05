
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { checkPendingSubtasks } from "../../services/subtasksService";

interface TaskStatusButtonsProps {
  taskId: string;
  status: string;
  canChangeStatus: boolean;
  onStatusChange: (taskId: string, newStatus: string) => void;
}

export const TaskStatusButtons = ({ 
  taskId, 
  status, 
  canChangeStatus, 
  onStatusChange 
}: TaskStatusButtonsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!canChangeStatus) {
      toast.error("لا يمكنك تغيير حالة المهمة لأنك لست المكلف بها");
      return;
    }
    
    setIsUpdating(true);
    try {
      if (newStatus === 'completed') {
        const { hasPendingSubtasks, error } = await checkPendingSubtasks(taskId);
        
        if (error) {
          toast.error(error);
          setIsUpdating(false);
          return;
        }
        
        if (hasPendingSubtasks) {
          toast.error("لا يمكن إكمال المهمة حتى يتم إكمال جميع المهام الفرعية");
          setIsUpdating(false);
          return;
        }
      }
      
      await onStatusChange(taskId, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!canChangeStatus) {
    return null;
  }
  
  return status !== 'completed' ? (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-7 w-7 p-0 ml-1"
      onClick={() => handleStatusUpdate('completed')}
      disabled={isUpdating}
      title="إكمال المهمة"
    >
      <Check className="h-3.5 w-3.5 text-green-500" />
    </Button>
  ) : (
    <Button 
      variant="outline" 
      size="sm" 
      className="h-7 w-7 p-0 ml-1"
      onClick={() => handleStatusUpdate('in_progress')}
      disabled={isUpdating}
      title="إعادة فتح المهمة"
    >
      <Clock className="h-3.5 w-3.5 text-amber-500" />
    </Button>
  );
};
