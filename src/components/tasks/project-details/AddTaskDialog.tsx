
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TaskForm } from "./components/TaskForm";
import { useTaskForm } from "./hooks/useTaskForm";
import { TaskFormData } from "./types/taskForm";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string | undefined;
  projectStages: { id: string; name: string }[];
  onSuccess: () => void;
}

export const AddTaskDialog = ({ 
  open, 
  onOpenChange, 
  projectId,
  projectStages,
  onSuccess 
}: AddTaskDialogProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    stageId,
    setStageId,
    assignedTo,
    setAssignedTo,
    isSubmitting,
    projectMembers,
    handleFormSubmit,
  } = useTaskForm({
    projectId,
    projectStages,
    onSuccess,
    onOpenChange
  });

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {/* Trigger is controlled externally */}
      </AlertDialogTrigger>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>إضافة مهمة جديدة</AlertDialogTitle>
          <AlertDialogDescription>
            أدخل تفاصيل المهمة لإنشائها في المشروع الحالي.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <TaskForm
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
          priority={priority}
          setPriority={setPriority}
          dueDate={dueDate}
          setDueDate={setDueDate}
          stageId={stageId}
          setStageId={setStageId}
          assignedTo={assignedTo}
          setAssignedTo={setAssignedTo}
          projectStages={projectStages}
          projectMembers={projectMembers}
        />
        
        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <Button 
            type="submit" 
            onClick={() => handleFormSubmit({
              title,
              description,
              status: "pending",
              priority,
              dueDate,
              stageId,
              assignedTo
            } as TaskFormData)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "جاري الإنشاء..." : "إنشاء"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
