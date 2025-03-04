import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function AddTaskDialog({ 
  open, 
  onOpenChange, 
  projectId, 
  projectStages, 
  onTaskAdded, 
  projectMembers 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectStages: { id: string; name: string }[];
  onTaskAdded: () => void;
  projectMembers: { id: string; name: string }[];
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [stageId, setStageId] = useState(projectStages[0]?.id || "");
  const [assignedTo, setAssignedTo] = useState(projectMembers[0]?.id || "");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Logic to handle task submission
    // After submission, call onTaskAdded and reset form
    setIsSubmitting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>إضافة مهمة جديدة</DialogTitle>
          <DialogDescription>
            أضف مهمة جديدة إلى المشروع. اضغط إرسال عند الانتهاء.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
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
            attachment={attachment}
            setAttachment={setAttachment}
            projectStages={projectStages}
            projectMembers={projectMembers}
          />
        </div>
        <DialogFooter className="sm:justify-end mt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            إلغاء
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            إرسال
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
