
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MeetingTask } from "@/types/meeting";
import { UserNameDisplay } from "@/components/meetings/tasks/UserNameDisplay";
import { MeetingTaskTemplatesDialog } from "@/components/meetings/tasks/MeetingTaskTemplatesDialog";
import { 
  MessageCircle, 
  FileDown, 
  Check, 
  Clock, 
  XCircle, 
  Pencil,
  Upload,
  Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useUpdateMeetingTask } from "@/hooks/meetings/useUpdateMeetingTask";
import { toast } from "sonner";

interface MeetingTaskItemProps {
  task: MeetingTask;
  onDelete?: (taskId: string) => void;
  onEdit?: (task: MeetingTask) => void;
  onRefresh?: () => void;
}

export const MeetingTaskItem: React.FC<MeetingTaskItemProps> = ({ 
  task, 
  onDelete, 
  onEdit,
  onRefresh
}) => {
  const [isTemplatesDialogOpen, setIsTemplatesDialogOpen] = useState(false);
  const [isDiscussionOpen, setIsDiscussionOpen] = useState(false);
  const { mutate: updateTask, isPending } = useUpdateMeetingTask();

  const handleStatusChange = (status: string) => {
    updateTask(
      {
        id: task.id,
        meeting_id: task.meeting_id,
        updates: { status }
      },
      {
        onSuccess: () => {
          if (onRefresh) onRefresh();
        }
      }
    );
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
    }
  };

  const handleViewTemplates = () => {
    setIsTemplatesDialogOpen(true);
  };

  const handleOpenDiscussion = () => {
    // For now, just show a toast since we don't have a discussion dialog yet
    toast.info("ميزة المناقشة قيد التطوير");
  };

  const handleOpenAttachments = () => {
    // For now, just show a toast since we don't have an attachments dialog yet
    toast.info("ميزة المستلمات قيد التطوير");
  };

  const handleUploadDeliverables = () => {
    // For now, just show a toast since we don't have an upload dialog yet
    toast.info("ميزة رفع المستلمات قيد التطوير");
  };

  return (
    <div className="bg-card hover:bg-accent/5 border rounded-lg p-4 transition-colors">
      <div className="flex justify-between items-start">
        <div className="space-y-1 w-full">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.title}</h3>
            <div className="flex gap-2 items-center">
              {task.task_type === 'action_item' && <Badge variant="outline">إجراء</Badge>}
              {task.task_type === 'follow_up' && <Badge variant="outline">متابعة</Badge>}
              {task.task_type === 'decision' && <Badge variant="outline">قرار</Badge>}
              {task.task_type === 'preparation' && <Badge variant="outline">تحضيرية</Badge>}
              {task.task_type === 'execution' && <Badge variant="outline">تنفيذية</Badge>}
              {task.task_type === 'other' && <Badge variant="outline">أخرى</Badge>}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {task.description && <p>{task.description}</p>}
          </div>
        </div>
      </div>
      
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex gap-3">
            {task.due_date && (
              <div>
                تاريخ الاستحقاق: {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: ar })}
              </div>
            )}
            {task.assigned_to && (
              <div>
                المسؤول: <UserNameDisplay userId={task.assigned_to} />
              </div>
            )}
          </div>
          <div>
            {task.status === 'pending' && <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">قيد الانتظار</Badge>}
            {task.status === 'in_progress' && <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">قيد التنفيذ</Badge>}
            {task.status === 'completed' && <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">مكتملة</Badge>}
            {task.status === 'cancelled' && <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">ملغاة</Badge>}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleOpenDiscussion}
          >
            <MessageCircle className="h-3.5 w-3.5" />
            مناقشة
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleUploadDeliverables}
          >
            <Upload className="h-3.5 w-3.5" />
            رفع مستلمات
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleOpenAttachments}
          >
            <Paperclip className="h-3.5 w-3.5" />
            المستلمات
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground"
            onClick={handleViewTemplates}
          >
            <FileDown className="h-3.5 w-3.5" />
            نماذج المهمة
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs flex items-center gap-1"
            onClick={handleEdit}
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500" />
            تعديل
          </Button>
          
          {task.status !== "completed" ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => handleStatusChange("completed")}
              disabled={isPending}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
              تمت
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={() => handleStatusChange("pending")}
              disabled={isPending}
            >
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              قيد التنفيذ
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <XCircle className="h-3.5 w-3.5" />
              حذف
            </Button>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <MeetingTaskTemplatesDialog
        task={task}
        open={isTemplatesDialogOpen}
        onOpenChange={setIsTemplatesDialogOpen}
      />
    </div>
  );
};
