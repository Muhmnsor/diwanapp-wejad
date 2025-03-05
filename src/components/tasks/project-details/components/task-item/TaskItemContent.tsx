
import { TableRow, TableCell } from "@/components/ui/table";
import { Task } from "../../types/task";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { TaskDiscussionDialog } from "../../../components/TaskDiscussionDialog";
import { SubtasksList } from "../subtasks/SubtasksList";
import { TaskStatusButtons } from "./TaskStatusButtons";
import { TaskAssigneeInfo } from "./TaskAssigneeInfo";
import { TaskSubtaskToggle } from "./TaskSubtaskToggle";
import { TaskActions } from "./TaskActions";
import { TaskDueDate } from "./TaskDueDate";
import { useFetchTaskAttachments } from "./useFetchTaskAttachments";

interface TaskItemContentProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TaskItemContent = ({
  task,
  getStatusBadge,
  getPriorityBadge,
  formatDate,
  onStatusChange,
  projectId
}: TaskItemContentProps) => {
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showDiscussion, setShowDiscussion] = useState(false);
  const { user } = useAuthStore();
  
  const { assigneeAttachment, handleDownload } = useFetchTaskAttachments(
    task.id, 
    task.assigned_to
  );
  
  const canChangeStatus = () => {
    return (
      user?.id === task.assigned_to || 
      user?.isAdmin || 
      user?.role === 'admin'
    );
  };

  return (
    <>
      <TableRow key={task.id} className="cursor-pointer hover:bg-gray-50">
        <TableCell className="font-medium">
          <div className="flex items-center">
            <span className="mr-1">{task.title}</span>
            <TaskSubtaskToggle
              showSubtasks={showSubtasks}
              onToggle={() => setShowSubtasks(!showSubtasks)}
            />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            {getStatusBadge(task.status)}
            <TaskStatusButtons
              taskId={task.id}
              status={task.status || 'pending'}
              canChangeStatus={canChangeStatus()}
              onStatusChange={onStatusChange}
            />
          </div>
        </TableCell>
        <TableCell>{getPriorityBadge(task.priority)}</TableCell>
        <TableCell>
          <TaskAssigneeInfo assignedUserName={task.assigned_user_name} />
        </TableCell>
        <TableCell>
          <TaskDueDate dueDate={task.due_date} formatDate={formatDate} />
        </TableCell>
        <TableCell>
          <TaskActions
            onShowDiscussion={() => setShowDiscussion(true)}
            assigneeAttachment={assigneeAttachment}
            onDownload={handleDownload}
          />
        </TableCell>
      </TableRow>
      
      {showSubtasks && (
        <TableRow>
          <TableCell colSpan={6} className="bg-gray-50 p-0">
            <div className="p-3">
              <SubtasksList 
                taskId={task.id} 
                projectId={projectId}
              />
            </div>
          </TableCell>
        </TableRow>
      )}

      <TaskDiscussionDialog 
        open={showDiscussion} 
        onOpenChange={setShowDiscussion}
        task={task}
      />
    </>
  );
};
