
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Subtask } from "../../types/subtask";
import { SubtaskTitleField } from "./fields/SubtaskTitleField";
import { SubtaskDueDateField } from "./fields/SubtaskDueDateField";
import { SubtaskAssigneeField } from "./fields/SubtaskAssigneeField";
import { TaskFormActions } from "../../components/TaskFormActions";
import { ProjectMember } from "../../types/projectMember";

interface EditSubtaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtask: Subtask;
  onUpdate: (subtaskId: string, updateData: Partial<Subtask>) => Promise<void>;
  projectMembers: ProjectMember[];
}

export const EditSubtaskDialog = ({
  open,
  onOpenChange,
  subtask,
  onUpdate,
  projectMembers
}: EditSubtaskDialogProps) => {
  const [title, setTitle] = useState(subtask.title);
  const [dueDate, setDueDate] = useState(subtask.due_date || "");
  const [assignedTo, setAssignedTo] = useState(subtask.assigned_to || "none");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form values when subtask changes
  useEffect(() => {
    if (subtask) {
      setTitle(subtask.title);
      setDueDate(subtask.due_date || "");
      setAssignedTo(subtask.assigned_to || "none");
    }
  }, [subtask]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const updateData: Partial<Subtask> = { title };
      
      // Only include dueDate if provided
      if (dueDate) {
        updateData.due_date = dueDate;
      } else {
        updateData.due_date = null;
      }
      
      // Handle assignee
      if (assignedTo === "none") {
        updateData.assigned_to = null;
      } else {
        updateData.assigned_to = assignedTo;
      }
      
      await onUpdate(subtask.id, updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating subtask:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المهمة الفرعية</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <SubtaskTitleField 
            title={title}
            setTitle={setTitle}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SubtaskDueDateField 
              dueDate={dueDate}
              setDueDate={setDueDate}
            />
            
            <SubtaskAssigneeField 
              assignedTo={assignedTo}
              setAssignedTo={setAssignedTo}
              projectMembers={projectMembers}
            />
          </div>
          
          <TaskFormActions 
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            submitLabel="تحديث المهمة"
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
