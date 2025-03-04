import { useState } from "react";
import { Task } from "../types/task";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Check, Clock, Briefcase, GitMerge, ArrowRight, Flag, MessageCircle } from "lucide-react";
import { formatDueDate } from "../utils/taskFormatters";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TaskDiscussionDialog } from "./TaskDiscussionDialog";

interface TaskListItemProps {
  task: Task;
}

export const TaskListItem = ({ task }: TaskListItemProps) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [status, setStatus] = useState(task.status);
  const [showDiscussion, setShowDiscussion] = useState(false);

  const getTaskStatus = () => {
    if (status === "completed") return "completed";
    
    const dueDate = task.due_date ? new Date(task.due_date) : null;
    const now = new Date();
    
    if (dueDate && dueDate < now) {
      return "delayed";
    }
    
    return status;
  };

  const getStatusText = (taskStatus: string) => {
    switch (taskStatus) {
      case "completed":
        return "مكتملة";
      case "delayed":
        return "متأخرة";
      case "pending":
        return "قيد التنفيذ";
      default:
        return "قيد التنفيذ";
    }
  };

  const getStatusVariant = (taskStatus: string) => {
    switch (taskStatus) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "delayed":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
        return "bg-green-50 text-green-700 border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "عالية";
      case "medium":
        return "متوسطة";
      case "low":
        return "منخفضة";
      default:
        return "غير محددة";
    }
  };

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

  const getBorderStyle = () => {
    if (task.is_subtask) {
      return "hover:shadow-md transition-shadow border-r-4 border-r-blue-400 bg-blue-50";
    }
    return "hover:shadow-md transition-shadow";
  };

  const currentStatus = getTaskStatus();

  return (
    <>
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
              <div className="flex flex-col gap-2">
                <Badge className={`text-xs ${getStatusVariant(currentStatus)}`}>
                  {getStatusText(currentStatus)}
                </Badge>
                <Badge className={`text-xs flex items-center gap-1 ${getPriorityVariant(task.priority)}`}>
                  <Flag className="h-3 w-3" />
                  {getPriorityText(task.priority)}
                </Badge>
              </div>
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
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowDiscussion(true)}
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
            </div>
          </div>
        </CardContent>
      </Card>

      <TaskDiscussionDialog 
        open={showDiscussion}
        onOpenChange={setShowDiscussion}
        task={task}
      />
    </>
  );
};
