
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskTitleField } from "../../components/TaskTitleField";
import { TaskDescriptionField } from "../../components/TaskDescriptionField";
import { TaskPriorityField } from "../../components/TaskPriorityField";
import { TaskCategoryField } from "../../components/TaskCategoryField";
import { TaskAssigneeField } from "../../components/TaskAssigneeField";
import { TaskFormActions } from "../../components/TaskFormActions";
import { ProjectMember } from "../../hooks/useProjectMembers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  workspaceId?: string;
  projectMembers: ProjectMember[];
  onSuccess?: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  projectId,
  workspaceId,
  projectMembers,
  onSuccess
}: RecurringTaskDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("إدارية");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [dayOfMonth, setDayOfMonth] = useState(25); // Default to the 25th of each month
  const [recurrenceType, setRecurrenceType] = useState("monthly");
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("يرجى تسجيل الدخول أولاً");
      }

      // Prepare data for inserting
      const recurringTaskData = {
        title,
        description,
        priority,
        category: projectId ? undefined : category,
        workspace_id: workspaceId || null,
        project_id: projectId || null,
        created_by: user.id,
        assign_to: assignedTo,
        recurrence_type: recurrenceType,
        day_of_month: recurrenceType === "monthly" ? dayOfMonth : null,
        requires_deliverable: requiresDeliverable
      };

      console.log("Creating recurring task:", recurringTaskData);

      // Insert into recurring_tasks table
      const { error } = await supabase
        .from('recurring_tasks')
        .insert([recurringTaskData]);

      if (error) throw error;

      toast.success("تم إنشاء المهمة المتكررة بنجاح");
      
      // Reset form
      setTitle("");
      setDescription("");
      setPriority("medium");
      setCategory("إدارية");
      setAssignedTo(null);
      setDayOfMonth(25);
      setRecurrenceType("monthly");
      setRequiresDeliverable(false);
      
      // Close dialog
      onOpenChange(false);
      
      // Trigger callback
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error creating recurring task:", error);
      toast.error("حدث خطأ أثناء إنشاء المهمة المتكررة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rtl">
        <DialogHeader>
          <DialogTitle>إضافة مهمة متكررة</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <TaskTitleField title={title} setTitle={setTitle} />
          <TaskDescriptionField description={description} setDescription={setDescription} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TaskPriorityField priority={priority} setPriority={setPriority} />
            {!projectId && (
              <TaskCategoryField category={category} setCategory={setCategory} />
            )}
          </div>
          
          <div className="space-y-2">
            <Label>نوع التكرار</Label>
            <Select 
              value={recurrenceType}
              onValueChange={setRecurrenceType}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التكرار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">شهري</SelectItem>
                {/* يمكن إضافة أنواع أخرى في المستقبل */}
              </SelectContent>
            </Select>
          </div>
          
          {recurrenceType === "monthly" && (
            <div className="space-y-2">
              <Label>اليوم من الشهر</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                سيتم إنشاء المهمة في اليوم {dayOfMonth} من كل شهر
              </p>
            </div>
          )}
          
          <TaskAssigneeField 
            assignedTo={assignedTo} 
            setAssignedTo={setAssignedTo} 
            projectMembers={projectMembers} 
          />
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Checkbox 
              id="requiresDeliverable"
              checked={requiresDeliverable}
              onCheckedChange={(checked) => setRequiresDeliverable(checked as boolean)}
            />
            <Label 
              htmlFor="requiresDeliverable" 
              className="text-sm cursor-pointer hover:text-primary transition-colors"
            >
              مستلمات المهمة إلزامية للإكمال
            </Label>
          </div>
          
          <TaskFormActions 
            isSubmitting={isSubmitting} 
            onCancel={() => onOpenChange(false)} 
            submitLabel="إنشاء مهمة متكررة"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
