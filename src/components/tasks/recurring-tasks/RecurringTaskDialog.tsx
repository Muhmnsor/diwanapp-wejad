
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { RecurringTaskFormFields } from "./RecurringTaskFormFields";
import { useProjects } from "@/hooks/useProjects";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useProjectMembers } from "@/components/tasks/project-details/hooks/useProjectMembers";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  is_active: boolean;
  day_of_month: number | null;
  project_id: string | null;
  workspace_id: string | null;
  priority: string;
  category: string | null;
  created_by: string;
  created_at: string;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
  requires_deliverable?: boolean;
}

interface RecurringTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: RecurringTask | null;
  onSaved: () => void;
}

export const RecurringTaskDialog = ({
  open,
  onOpenChange,
  task,
  onSaved
}: RecurringTaskDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { projects } = useProjects();
  const { workspaces } = useWorkspaces();
  const { projectMembers } = useProjectMembers("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<string>("monthly");
  const [interval, setInterval] = useState<number>(1);
  const [dayOfMonth, setDayOfMonth] = useState<number | null>(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>("medium");
  const [category, setCategory] = useState<string | null>("إدارية");
  const [assignTo, setAssignTo] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [requiresDeliverable, setRequiresDeliverable] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setRecurrenceType(task.recurrence_type || "monthly");
      setInterval(task.interval || 1);
      setDayOfMonth(task.day_of_month);
      setProjectId(task.project_id);
      setWorkspaceId(task.workspace_id);
      setPriority(task.priority || "medium");
      setCategory(task.category || "إدارية");
      setAssignTo(task.assign_to);
      setIsActive(task.is_active);
      setRequiresDeliverable(task.requires_deliverable || false);
    } else {
      // Reset form for new task
      setTitle("");
      setDescription("");
      setRecurrenceType("monthly");
      setInterval(1);
      setDayOfMonth(1);
      setProjectId(null);
      setWorkspaceId(null);
      setPriority("medium");
      setCategory("إدارية");
      setAssignTo(null);
      setIsActive(true);
      setRequiresDeliverable(false);
    }
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        recurrence_type: recurrenceType,
        interval,
        day_of_month: recurrenceType === "monthly" ? dayOfMonth : null,
        project_id: projectId,
        workspace_id: workspaceId,
        priority,
        category: !projectId ? category : null,
        is_active: isActive,
        assign_to: assignTo,
        requires_deliverable: requiresDeliverable
      };

      let error;

      if (task) {
        // Update existing task
        const { error: updateError } = await supabase
          .from("recurring_tasks")
          .update(taskData)
          .eq("id", task.id);
        
        error = updateError;
      } else {
        // Create new task
        const { error: insertError } = await supabase
          .from("recurring_tasks")
          .insert(taskData);
        
        error = insertError;
      }

      if (error) throw error;

      toast.success(task ? "تم تحديث المهمة المتكررة بنجاح" : "تم إنشاء المهمة المتكررة بنجاح");
      onSaved();
    } catch (error) {
      console.error("Error saving recurring task:", error);
      toast.error("حدث خطأ أثناء حفظ المهمة المتكررة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {task ? "تعديل مهمة متكررة" : "إنشاء مهمة متكررة جديدة"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
          <RecurringTaskFormFields
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            recurrenceType={recurrenceType}
            setRecurrenceType={setRecurrenceType}
            interval={interval}
            setInterval={setInterval}
            dayOfMonth={dayOfMonth}
            setDayOfMonth={setDayOfMonth}
            projectId={projectId}
            setProjectId={setProjectId}
            workspaceId={workspaceId}
            setWorkspaceId={setWorkspaceId}
            priority={priority}
            setPriority={setPriority}
            category={category}
            setCategory={setCategory}
            assignTo={assignTo}
            setAssignTo={setAssignTo}
            isActive={isActive}
            setIsActive={setIsActive}
            projects={projects}
            workspaces={workspaces}
            projectMembers={projectMembers}
            requiresDeliverable={requiresDeliverable}
            setRequiresDeliverable={setRequiresDeliverable}
          />

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : task ? (
                "تحديث المهمة"
              ) : (
                "إنشاء المهمة"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
