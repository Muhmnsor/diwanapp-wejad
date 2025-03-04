
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageCircle } from "lucide-react";
import { Task } from "../../types/task";

interface TaskDiscussionHeaderProps {
  task: Task;
}

export const TaskDiscussionHeader = ({ task }: TaskDiscussionHeaderProps) => {
  return (
    <DialogHeader>
      <DialogTitle className="text-xl flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <span>مناقشة حول: {task.title}</span>
      </DialogTitle>
    </DialogHeader>
  );
};
