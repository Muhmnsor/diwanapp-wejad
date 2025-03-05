
import { Task } from "../types/task";
import { TaskItemContent } from "./task-item/TaskItemContent";

interface TaskItemProps {
  task: Task;
  getStatusBadge: (status: string) => JSX.Element;
  getPriorityBadge: (priority: string | null) => JSX.Element | null;
  formatDate: (date: string | null) => string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  projectId: string;
}

export const TaskItem = (props: TaskItemProps) => {
  return <TaskItemContent {...props} />;
};
