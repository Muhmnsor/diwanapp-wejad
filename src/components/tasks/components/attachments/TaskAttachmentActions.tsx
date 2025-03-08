
import { Button } from "@/components/ui/button";
import { FileIcon, PaperclipIcon, FileTextIcon } from "lucide-react";
import { AssigneeAttachmentButton } from "./AssigneeAttachmentButton";
import { Task } from "../../types/task";

interface TaskAttachmentActionsProps {
  task: Task;
  onAttachmentUploaded: () => void;
}

export const TaskAttachmentActions = ({ task, onAttachmentUploaded }: TaskAttachmentActionsProps) => {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="file-upload-btn"
        onClick={() => document.getElementById(`task-template-${task.id}`)?.click()}
      >
        <FileTextIcon className="h-4 w-4 mr-1" />
        النماذج
      </Button>
      <input
        id={`task-template-${task.id}`}
        type="file"
        className="hidden"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="file-upload-btn"
        onClick={() => document.getElementById(`task-attachment-${task.id}`)?.click()}
      >
        <FileIcon className="h-4 w-4 mr-1" />
        المرفقات
      </Button>
      <input
        id={`task-attachment-${task.id}`}
        type="file"
        className="hidden"
      />
      
      <AssigneeAttachmentButton 
        taskId={task.id} 
        onAttachmentUploaded={onAttachmentUploaded}
        buttonText="ملفات المكلف"
      />
    </div>
  );
};
