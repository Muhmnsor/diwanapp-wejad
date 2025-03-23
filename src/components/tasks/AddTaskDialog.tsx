import { useState } from "react";
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
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TaskType } from "@/types/meeting";

interface AddTaskDialogProps {
  meetingId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const AddTaskDialog = ({ 
  meetingId, 
  open, 
  onOpenChange,
  onSuccess 
}: AddTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [taskType, setTaskType] = useState<TaskType>("action_item");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingId) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase.from('meeting_tasks').insert({
        meeting_id: meetingId,
        title,
        description: description || undefined,
        due_date: dueDate || undefined,
        assigned_to: assignedTo || undefined,
        task_type: taskType,
        status: "pending",
        created_at: new Date().toISOString(),
        priority: priority,
        add_to_general_tasks: false
      });
      
      if (error) throw error;
      
      toast.success("تمت إضافة المهمة بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Error adding task:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setAssignedTo("");
    setTaskType("action_item");
    setPriority("medium");
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
              <Select 
                value={taskType} 
                onValueChange={(value) => {
                  setTaskType(value as TaskType);
                }}
              >
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
              <Select 
                value={priority} 
                onValueChange={(value) => {
                  setPriority(value as "high" | "medium" | "low");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر أولوية المهمة" />
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
              disabled={isSubmitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={!title || isSubmitting}>
              {isSubmitting ? "جاري الإضافة..." : "إضافة المهمة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
