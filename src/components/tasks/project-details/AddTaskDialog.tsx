
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { ProjectMember } from "./types/projectMember";
import { useTaskForm } from "./hooks/useTaskForm";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: ProjectMember[];
  isGeneral?: boolean;
  isWorkspace?: boolean;
  meetingId?: string;
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
  meetingId
}: AddTaskDialogProps) => {
  const { isSubmitting, error, handleSubmit } = useTaskForm({
    projectId,
    isGeneral,
    onTaskAdded,
    meetingId
  });

  const onSubmit = async (formData: {
    title: string;
    description: string;
    dueDate: string;
    priority: string;
    stageId: string;
    assignedTo: string | null;
    templates?: File[] | null;
    category?: string;
    requiresDeliverable?: boolean;
  }) => {
    await handleSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {meetingId ? "إضافة مهمة اجتماع" : isGeneral ? "إضافة مهمة عامة" : "إضافة مهمة للمشروع"}
          </DialogTitle>
        </DialogHeader>
        <TaskForm
          onSubmit={onSubmit}
          isSubmitting={isSubmitting}
          projectStages={projectStages}
          projectMembers={projectMembers}
          isGeneral={isGeneral || !!meetingId}
        />
      </DialogContent>
    </Dialog>
  );
};
