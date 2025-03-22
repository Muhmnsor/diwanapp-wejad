
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ProjectMember } from "./types/projectMember";
import { TaskForm } from "./TaskForm";
import { useTaskForm } from "./hooks/useTaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  isWorkspace?: boolean;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange,
  projectId,
  projectStages,
  onTaskAdded,
  projectMembers,
  isGeneral = false,
  isWorkspace = false
}: AddTaskDialogProps) => {
  const { isSubmitting, error, handleSubmit } = useTaskForm({
    projectId,
    isGeneral,
    onTaskAdded
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isGeneral ? "إضافة مهمة عامة" : "إضافة مهمة جديدة"}</DialogTitle>
        </DialogHeader>
        
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          isGeneral={isGeneral}
        />
      </DialogContent>
    </Dialog>
  );
};
