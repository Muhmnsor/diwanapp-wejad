
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "../../types/task";
import { TaskAttachmentsList } from "../attachments/TaskAttachmentsList";
import { AssigneeAttachmentButton } from "../attachments/AssigneeAttachmentButton";
import { useState } from "react";
import { useAuthStore } from "@/store/refactored-auth";

interface TaskAttachmentDialogProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TaskAttachmentDialog = ({
  task,
  open,
  onOpenChange
}: TaskAttachmentDialogProps) => {
  const { user } = useAuthStore();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const isAssigned = user?.id === task.assigned_to;
  
  const handleAttachmentUploaded = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>مرفقات المهمة: {task.title}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isAssigned && (
            <div className="mb-4">
              <AssigneeAttachmentButton 
                taskId={task.id}
                onAttachmentUploaded={handleAttachmentUploaded}
                buttonVariant="default"
                buttonSize="default"
                buttonText="إضافة مرفق من المكلف"
              />
            </div>
          )}
          
          <TaskAttachmentsList 
            key={refreshKey}
            taskId={task.id}
            maxItems={20}
            onDelete={handleAttachmentUploaded}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
