
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, User2, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Task } from "@/types/workspace";
import { TaskDependenciesBadge } from "./components/TaskDependenciesBadge";

interface ViewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
}

export const ViewTaskDialog = ({
  open,
  onOpenChange,
  task
}: ViewTaskDialogProps) => {
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-600";
      case "low":
        return "text-green-600";
      default:
        return "";
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">مكتملة</Badge>;
      case "in_progress":
        return <Badge variant="secondary">قيد التنفيذ</Badge>;
      case "delayed":
        return <Badge variant="destructive">متأخرة</Badge>;
      case "cancelled":
        return <Badge variant="outline">ملغية</Badge>;
      default:
        return <Badge variant="outline">معلقة</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rtl" dir="rtl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>{task.title}</DialogTitle>
            <div className="flex gap-2">
              {getStatusBadge(task.status)}
              <TaskDependenciesBadge taskId={task.id} />
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {task.description && (
            <div>
              <h4 className="mb-2 text-sm font-medium">الوصف</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {task.due_date && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  استحقاق: {formatDate(task.due_date)}
                </span>
              </div>
            )}

            {task.priority && (
              <div className="flex items-center gap-2">
                <AlertCircle className={`h-4 w-4 ${getPriorityColor(task.priority)}`} />
                <span className="text-sm">
                  الأولوية: {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                </span>
              </div>
            )}

            {task.assigned_to && (
              <div className="flex items-center gap-2">
                <User2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  مسند إلى: {task.assigned_user_name || 'مستخدم'}
                </span>
              </div>
            )}

            {task.created_at && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  تاريخ الإنشاء: {formatDate(task.created_at)}
                </span>
              </div>
            )}
          </div>

          {task.stage_name && (
            <div>
              <h4 className="mb-2 text-sm font-medium">المرحلة</h4>
              <Badge variant="outline">{task.stage_name}</Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
