
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Clock, MessageCircle } from "lucide-react";
import { Task } from "../../types/task";

interface TaskActionsProps {
  task: Task;
  status: string;
  setStatus: (status: string) => void;
  onShowDiscussion: () => void;
}

export const TaskActions = ({ task, status, setStatus, onShowDiscussion }: TaskActionsProps) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleCompleteTask = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    
    try {
      let tableName = task.is_subtask ? "subtasks" : "portfolio_tasks";
      let query = supabase
        .from(tableName)
        .update({ status: status === "completed" ? "pending" : "completed" })
        .eq("id", task.id);
      
      let { error } = await query;
      
      if (error && error.code === "PGRST116") {
        tableName = "tasks";
        query = supabase
          .from(tableName)
          .update({ status: status === "completed" ? "pending" : "completed" })
          .eq("id", task.id);
        
        const { error: secondError } = await query;
        
        if (secondError) {
          throw secondError;
        }
      } else if (error) {
        throw error;
      }
      
      setStatus(status === "completed" ? "pending" : "completed");
      
      toast.success(status === "completed" 
        ? "تم إعادة المهمة إلى قيد التنفيذ" 
        : "تم إكمال المهمة بنجاح"
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        onClick={onShowDiscussion}
        variant="outline"
        size="sm"
        className="h-8"
      >
        <MessageCircle className="h-4 w-4 ml-1" />
        مناقشة
      </Button>
      
      <Button 
        onClick={handleCompleteTask}
        disabled={isCompleting}
        variant={status === "completed" ? "outline" : "default"}
        size="sm"
        className="h-8"
      >
        {status === "completed" ? (
          <>
            <Clock className="h-4 w-4 ml-1" />
            إعادة فتح
          </>
        ) : (
          <>
            <Check className="h-4 w-4 ml-1" />
            إتمام
          </>
        )}
      </Button>
    </div>
  );
};
