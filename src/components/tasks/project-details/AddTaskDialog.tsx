
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
  meetingId?: string; // Added meetingId prop
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange,
  projectId,
  projectStages,
  onTaskAdded,
  projectMembers,
  isGeneral = false,
  isWorkspace = false,
  meetingId // Add meetingId to props
}: AddTaskDialogProps) => {
  const { isSubmitting, error, handleSubmit } = useTaskForm({
    projectId,
    isGeneral,
    onTaskAdded,
    meetingId // Pass meetingId to useTaskForm
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isGeneral ? "إضافة مهمة عامة" : meetingId ? "إضافة مهمة للاجتماع" : "إضافة مهمة جديدة"}</DialogTitle>
        </DialogHeader>
        
        <TaskForm
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          isGeneral={isGeneral}
          meetingId={meetingId} // Pass meetingId to TaskForm
        />
      </DialogContent>
    </Dialog>
  );
};
