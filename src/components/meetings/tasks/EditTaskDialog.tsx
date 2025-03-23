
import { useEffect, useState } from "react";
import { useUpdateMeetingTask } from "@/hooks/meetings/useUpdateMeetingTask";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskStatus, TaskType } from "@/types/meeting";
import { Loader2 } from "lucide-react";

interface EditTaskDialogProps {
  meetingId: string;
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EditTaskDialog = ({ 
  meetingId,
  task,
  open, 
  onOpenChange,
  onSuccess 
}: EditTaskDialogProps) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [assignedTo, setAssignedTo] = useState(task.assigned_to || "");
  const [taskType, setTaskType] = useState<TaskType>(task.task_type);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  
  const { mutate: updateTask, isPending } = useUpdateMeetingTask();
  
  useEffect(() => {
    if (open) {
      // Update form when task changes or dialog opens
      setTitle(task.title);
      setDescription(task.description || "");
      setDueDate(task.due_date || "");
      setAssignedTo(task.assigned_to || "");
      setTaskType(task.task_type);
      setStatus(task.status);
    }
  }, [task, open]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateTask({
      id: task.id,
      meeting_id: meetingId,
      updates: {
        title,
        description: description || undefined,
        due_date: dueDate || undefined,
        assigned_to: assignedTo || undefined,
        task_type: taskType,
        status
      }
    }, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>تعديل المهمة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان المهمة *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="أدخل عنوان المهمة"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">وصف المهمة</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="أدخل وصف المهمة (اختياري)"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskType">نوع المهمة</Label>
              <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action_item">إجراء</SelectItem>
                  <SelectItem value="follow_up">متابعة</SelectItem>
                  <SelectItem value="decision">قرار</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">حالة المهمة</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedTo">المسؤول عن التنفيذ</Label>
              <Input
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                placeholder="أدخل اسم أو معرف المسؤول"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-start gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!title || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
