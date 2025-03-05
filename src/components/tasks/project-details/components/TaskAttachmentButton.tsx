
import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import { useState } from "react";
import { TaskAttachmentDialog } from "../../components/dialogs/TaskAttachmentDialog";
import { Task } from "../types/task";

interface TaskAttachmentButtonProps {
  task: Task;
}

export const TaskAttachmentButton = ({ task }: TaskAttachmentButtonProps) => {
  const [showAttachments, setShowAttachments] = useState(false);
  
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className="px-2"
        onClick={() => setShowAttachments(true)}
      >
        <Paperclip className="h-4 w-4 text-gray-500" />
      </Button>

      {showAttachments && (
        <TaskAttachmentDialog
          task={task}
          open={showAttachments}
          onOpenChange={(open) => {
            if (!open) setShowAttachments(false);
          }}
        />
      )}
    </>
  );
};
