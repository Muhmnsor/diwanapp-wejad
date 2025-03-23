
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateMeetingTask } from "@/hooks/meetings/useCreateMeetingTask";
import { TaskType, TaskStatus } from "@/types/meeting";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { useTaskTemplates } from "@/hooks/meetings/useTaskTemplates";
import { AddTemplateButton } from "./AddTemplateButton";

interface EnhancedTaskCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meetingId: string;
  onSuccess?: () => void;
}

export const EnhancedTaskCreationDialog: React.FC<EnhancedTaskCreationDialogProps> = ({
  open,
  onOpenChange,
  meetingId,
  onSuccess
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [assignedTo, setAssignedTo] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [addToGeneralTasks, setAddToGeneralTasks] = useState(false);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");

  const { templates, setTemplates, uploadTemplates } = useTaskTemplates();

  const createTask = useCreateMeetingTask();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("action_item");
    setDueDate(undefined);
    setAssignedTo("");
    setPriority("medium");
    setAddToGeneralTasks(false);
    setRequiresDeliverable(false);
    setTemplates(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      return;
    }

    try {
      const task = await createTask.mutateAsync({
        meeting_id: meetingId,
        title,
        description,
        due_date: dueDate ? format(dueDate, 'yyyy-MM-dd') : undefined,
        assigned_to: assignedTo,
        task_type: taskType,
        status: "pending",
        priority,
        add_to_general_tasks: addToGeneralTasks,
        requires_deliverable: requiresDeliverable,
        templates: templates
      });
      
      // If we have templates and they weren't included in the create call, upload them now
      if (templates && templates.length > 0 && !task.templates) {
        await uploadTemplates(task.id);
      }
      
      resetForm();
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    }}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-lg">إضافة مهمة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان المهمة</Label>
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
              placeholder="وصف تفصيلي للمهمة" 
              rows={3} 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-type">نوع المهمة</Label>
            <Select 
              value={taskType} 
              onValueChange={(value) => setTaskType(value as TaskType)}
            >
              <SelectTrigger id="task-type">
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
            <Select 
              value={priority} 
              onValueChange={(value) => setPriority(value as "high" | "medium" | "low")}
            >
              <SelectTrigger id="priority">
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
            <Label htmlFor="due-date">تاريخ الاستحقاق</Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-right"
                  type="button"
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, 'PPP', { locale: ar })
                  ) : (
                    <span>اختر تاريخ الاستحقاق</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned-to">تعيين إلى</Label>
            <Input 
              id="assigned-to" 
              value={assignedTo} 
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="اسم الشخص المسؤول" 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="add-to-general" 
                checked={addToGeneralTasks}
                onCheckedChange={(checked) => setAddToGeneralTasks(!!checked)}
              />
              <Label htmlFor="add-to-general" className="font-normal">
                إضافة للمهام العامة
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox 
                id="requires-deliverable" 
                checked={requiresDeliverable}
                onCheckedChange={(checked) => setRequiresDeliverable(!!checked)}
              />
              <Label htmlFor="requires-deliverable" className="font-normal">
                تتطلب تسليم مرفقات
              </Label>
            </div>
          </div>

          <AddTemplateButton 
            templates={templates}
            setTemplates={setTemplates}
          />

          <div className="flex justify-between pt-4">
            <Button 
              variant="outline" 
              type="button"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={createTask.isPending}>
              {createTask.isPending ? "جاري الحفظ..." : "حفظ المهمة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
