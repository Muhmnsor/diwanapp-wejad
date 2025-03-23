
import React, { useState } from "react";
import { Task } from "../types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Check, Clock, MessageCircle, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { TaskActions } from "@/components/tasks/components/actions/TaskActions";
import { getTaskAvatar } from "../utils/taskAvatarUtils";

interface ProjectTaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => React.ReactElement;
  getPriorityBadge: (priority: string | null) => React.ReactElement | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  projectId?: string;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  customRenderTaskActions?: (task: Task) => React.ReactNode;
}

export const ProjectTaskItem = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId,
  onEditTask,
  onDeleteTask,
  customRenderTaskActions
}: ProjectTaskItemProps) => {
  const [status, setStatus] = useState(task.status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // User avatar or placeholder
  const avatar = getTaskAvatar(task);

  const handleStatusChange = async () => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      const newStatus = status === "completed" ? "pending" : "completed";
      await onStatusChange(task.id, newStatus);
      setStatus(newStatus);
      toast.success(
        newStatus === "completed" 
          ? "تم إكمال المهمة بنجاح" 
          : "تم إعادة المهمة إلى قيد التنفيذ"
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

    setIsDeleting(true);
    try {
      await onDeleteTask(task.id);
      toast.success("تم حذف المهمة بنجاح");
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleShowDiscussion = () => {
    // This is just a placeholder, the actual discussion will be handled by the parent component
  };

  return (
    <Card className={`overflow-hidden ${status === "completed" ? "bg-slate-50/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Task Title & Badges */}
          <div className="flex justify-between">
            <h3 className={`font-medium ${status === "completed" ? "line-through text-muted-foreground" : ""}`}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(status)}
              {getPriorityBadge(task.priority)}
            </div>
          </div>

          {/* Task Details */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {task.due_date && (
                <div className="text-muted-foreground">
                  <span className="inline-block ml-1">تاريخ الاستحقاق:</span>
                  {formatDate(task.due_date)}
                </div>
              )}
              
              {task.assigned_to && (
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">المسؤول:</span>
                  <div className="flex items-center">
                    {avatar}
                    <span className="text-sm">
                      {task.assigned_user_name || task.assigned_to}
                    </span>
                  </div>
                </div>
              )}
              
              {task.project_name && (
                <Badge variant="outline" className="font-normal">
                  {task.project_name}
                </Badge>
              )}
              
              {task.stage_name && (
                <Badge variant="outline" className="font-normal">
                  {task.stage_name}
                </Badge>
              )}
            </div>

            {/* Task Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {customRenderTaskActions ? (
                customRenderTaskActions(task)
              ) : (
                <>
                  <Button 
                    onClick={() => onEditTask(task)}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    <Pencil className="h-4 w-4 ml-1" />
                    تعديل
                  </Button>
                  
                  <Button 
                    onClick={handleShowDiscussion}
                    variant="ghost"
                    size="sm"
                    className="h-8"
                  >
                    <MessageCircle className="h-4 w-4 ml-1" />
                    مناقشة
                  </Button>
                  
                  <Button 
                    onClick={handleStatusChange}
                    disabled={isUpdating}
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
                  
                  <Button 
                    onClick={handleDelete}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={isDeleting}
                  >
                    <Trash className="h-4 w-4 ml-1" />
                    حذف
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
