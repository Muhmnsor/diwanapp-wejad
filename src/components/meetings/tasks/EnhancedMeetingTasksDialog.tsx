
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { TaskType, TaskStatus } from "@/types/meeting";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UserSelector } from "./UserSelector";
import { TaskAttachmentField } from "@/components/tasks/project-details/components/TaskAttachmentField";

interface EnhancedMeetingTasksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

export const EnhancedMeetingTasksDialog: React.FC<EnhancedMeetingTasksDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(false);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  const [attachment, setAttachment] = useState<File[] | null>(null);

  const { mutate: createTask, isPending } = useCreateMeetingTask();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignedTo("");
    setTaskType("action_item");
    setPriority("medium");
    setAddToGeneralTasks(false);
    setRequiresDeliverable(false);
    setAttachment(null);
  };

  const handleSubmit = () => {
    if (!title) {
      toast.error("الرجاء إدخال عنوان المهمة");
      return;
    }

    createTask(
      {
        meeting_id: meetingId,
        title,
        description,
        due_date: dueDate,
        assigned_to: assignedTo === "unassigned" ? undefined : assignedTo,
        task_type: taskType,
        status: "pending",
        add_to_general_tasks: addToGeneralTasks,
        requires_deliverable: requiresDeliverable,
        priority,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
          if (onSuccess) {
            onSuccess();
          }
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        resetForm();
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المهمة</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="أدخل عنوان المهمة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف المهمة</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="أدخل وصف المهمة"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
              <DatePicker
                value={dueDate}
                onChange={setDueDate}
                placeholder="اختر تاريخ الاستحقاق"
              />
            </div>

            <UserSelector
              value={assignedTo}
              onChange={setAssignedTo}
              meetingId={meetingId}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskType">نوع المهمة</Label>
              <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر نوع المهمة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="action_item">إجراء</SelectItem>
                  <SelectItem value="follow_up">متابعة</SelectItem>
                  <SelectItem value="decision">قرار</SelectItem>
                  <SelectItem value="preparation">تحضيرية</SelectItem>
                  <SelectItem value="execution">تنفيذية</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as "high" | "medium" | "low")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <TaskAttachmentField
            attachment={attachment}
            setAttachment={setAttachment}
            category="meeting-task"
            label="إرفاق ملف"
          />

          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="addToGeneralTasks"
                checked={addToGeneralTasks}
                onCheckedChange={(checked) => setAddToGeneralTasks(checked as boolean)}
              />
              <Label htmlFor="addToGeneralTasks">إضافة إلى المهام العامة</Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="requiresDeliverable"
                checked={requiresDeliverable}
                onCheckedChange={(checked) => setRequiresDeliverable(checked as boolean)}
              />
              <Label htmlFor="requiresDeliverable">تتطلب تسليم</Label>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-row-reverse">
          <Button onClick={handleSubmit} disabled={isPending} className="ml-2">
            {isPending ? "جاري الإضافة..." : "إضافة المهمة"}
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
