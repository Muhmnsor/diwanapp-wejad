
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Task } from "@/components/tasks/types/task";
import { MeetingTaskStatusBadge } from "./MeetingTaskStatusBadge";
import { TaskDiscussionDialog } from "@/components/tasks/components/TaskDiscussionDialog";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface MeetingTaskItemProps {
  task: Task;
  onStatusChange: (taskId: string, status: string) => void;
}

export const MeetingTaskItem: React.FC<MeetingTaskItemProps> = ({ 
  task, 
  onStatusChange 
}) => {
  const [showDiscussion, setShowDiscussion] = useState(false);
  
  // Format the due date if available
  const formattedDueDate = task.due_date 
    ? formatDistanceToNow(new Date(task.due_date), { 
        addSuffix: true, 
        locale: ar 
      })
    : 'غير محدد';
    
  // Format the creation date
  const formattedCreatedAt = task.created_at 
    ? formatDistanceToNow(new Date(task.created_at), { 
        addSuffix: true, 
        locale: ar 
      })
    : 'غير معروف';

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="font-medium">{task.title}</div>
        {task.description && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {task.description}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <MeetingTaskStatusBadge status={task.status as any} />
      </td>
      <td className="px-4 py-3">
        <div className="text-sm">{task.assigned_user_name || "غير محدد"}</div>
      </td>
      <td className="px-4 py-3 text-sm">{formattedDueDate}</td>
      <td className="px-4 py-3 text-sm">{formattedCreatedAt}</td>
      <td className="px-4 py-3">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={() => setShowDiscussion(true)}
          title="مناقشة المهمة"
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
        
        {showDiscussion && (
          <TaskDiscussionDialog
            open={showDiscussion}
            onOpenChange={setShowDiscussion}
            task={task}
            onStatusChange={onStatusChange}
          />
        )}
      </td>
    </tr>
  );
};
