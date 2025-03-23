import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TaskType } from "@/types/meeting";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { UserSelector } from "./UserSelector";
import { TaskAttachmentField } from "@/components/tasks/project-details/components/TaskAttachmentField";
import { EnhancedAddTaskDialog } from "./EnhancedAddTaskDialog";
import { toast } from "sonner";
import { uploadAttachment, saveAttachmentReference } from "@/components/tasks/services/uploadService";

interface MeetingTasksDialogProps {
  meetingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MeetingTasksDialog: React.FC<MeetingTasksDialogProps> = ({
  meetingId,
  open,
  onOpenChange,
  onSuccess,
}) => {
  // If meetingId is not provided, use the original component
  if (!meetingId) {
    return (
      <EnhancedAddTaskDialog 
        open={open} 
        onOpenChange={onOpenChange} 
        onSuccess={onSuccess}
      />
    );
  }

  // Otherwise use our enhanced version with templates and checkboxes
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("unassigned");
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [templates, setTemplates] = useState<File[] | null>(null);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(false);
  
  const createTask = useCreateMeetingTask();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Create the task
      const taskData = await createTask.mutateAsync({
        meeting_id: meetingId,
        title,
        description: description || undefined,
        due_date: dueDate || undefined,
        assigned_to: assignedTo !== "unassigned" ? assignedTo : undefined,
        task_type: taskType,
        status: "pending",
        add_to_general_tasks: addToGeneralTasks,
        requires_deliverable: requiresDeliverable,
        priority: priority,
      });
      
      // If we have template files, upload them
      if (templates && templates.length > 0 && taskData) {
        try {
          for (const file of templates) {
            const uploadResult = await uploadAttachment(file, "template");
            if (uploadResult.url && !uploadResult.error) {
              await saveAttachmentReference(
                taskData.id,
                uploadResult.url, 
                file.name,
                file.type,
                "template"
              );
            }
          }
          toast.success("تم رفع النماذج بنجاح");
        } catch (uploadError) {
          console.error("Error uploading templates:", uploadError);
          toast.error("حدث خطأ أثناء رفع النماذج");
        }
      }
      
      onSuccess?.();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };
  
  const handleReset = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignedTo("unassigned");
    setTaskType("action_item");
    setPriority("medium");
    setTemplates(null);
    setRequiresDeliverable(false);
    setAddToGeneralTasks(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>إضافة مهمة جديدة</DialogTitle>
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
                  <SelectItem value="preparation">تحضيرية</SelectItem>
                  <SelectItem value="execution">تنفيذية</SelectItem>
                  <SelectItem value="follow_up">متابعة</SelectItem>
                  <SelectItem value="action_item">إجراء</SelectItem>
                  <SelectItem value="decision">قرار</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as "high" | "medium" | "low")}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="low">منخفضة</SelectItem>
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
            
            <UserSelector
              value={assignedTo}
              onChange={setAssignedTo}
              meetingId={meetingId}
              label="المسؤول عن التنفيذ"
              placeholder="اختر المسؤول عن التنفيذ"
            />
            
            <TaskAttachmentField
              attachment={templates}
              setAttachment={setTemplates}
              category="template"
            />
            
            <div className="flex items-center space-x-2 space-x-reverse mt-4">
              <Checkbox 
                id="requiresDeliverable" 
                checked={requiresDeliverable}
                onCheckedChange={(checked) => setRequiresDeliverable(!!checked)}
              />
              <Label 
                htmlFor="requiresDeliverable" 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                إلزامية مستلمات
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="addToGeneralTasks" 
                checked={addToGeneralTasks}
                onCheckedChange={(checked) => setAddToGeneralTasks(!!checked)}
              />
              <Label 
                htmlFor="addToGeneralTasks" 
                className="text-sm font-medium leading-none cursor-pointer"
              >
                إضافة المهمة للمهام العامة
              </Label>
            </div>
          </div>
          
          <DialogFooter className="flex justify-start gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                handleReset();
                onOpenChange(false);
              }}
              disabled={createTask.isPending}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!title || createTask.isPending}>
              {createTask.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                'إضافة المهمة'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
