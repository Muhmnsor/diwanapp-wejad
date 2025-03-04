
import { useState } from "react";
import { Task } from "../types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Clock, Briefcase, ChevronDown, ChevronUp, ArrowRight, GitMerge } from "lucide-react";
import { formatDueDate, getStatusBadge } from "../utils/taskFormatters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TaskListItemProps {
  task: Task;
}

export const TaskListItem = ({ task }: TaskListItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [status, setStatus] = useState(task.status);
  
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
      
      // إذا لم يتم العثور على المهمة في الجدول الأول، حاول في الجدول الآخر
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

  // أسلوب خاص للمهام الفرعية
  const getBorderStyle = () => {
    if (task.is_subtask) {
      return "hover:shadow-md transition-shadow border-r-4 border-r-blue-400 bg-blue-50";
    }
    return "hover:shadow-md transition-shadow";
  };

  return (
    <Card className={getBorderStyle()}>
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div>
              {task.is_subtask && (
                <div className="flex items-center gap-1 mb-1">
                  <GitMerge className="h-4 w-4 text-blue-500" />
                  <Badge variant="outline" className="text-xs bg-blue-50">مهمة فرعية</Badge>
                </div>
              )}
              <h3 className="font-semibold text-lg">{task.title}</h3>
              {task.description && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{task.description}</p>
              )}
            </div>
            <Badge variant={status === "completed" ? "outline" : "default"} className="text-xs">
              {status === "completed" ? "مكتملة" : "قيد التنفيذ"}
            </Badge>
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
            <div className="flex flex-wrap items-center gap-4">
              {task.due_date && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 ml-1" />
                  <span>{formatDueDate(task.due_date)}</span>
                </div>
              )}
              
              {task.project_name && task.project_name !== 'مشروع غير محدد' && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 ml-1" />
                  <span>{task.project_name}</span>
                </div>
              )}
              
              {task.is_subtask && task.parent_task_id && (
                <div className="flex items-center text-sm text-blue-500">
                  <ArrowRight className="h-4 w-4 ml-1" />
                  <span>تابعة لمهمة رئيسية</span>
                </div>
              )}
            </div>
            
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
        </div>
      </CardContent>
    </Card>
  );
};
