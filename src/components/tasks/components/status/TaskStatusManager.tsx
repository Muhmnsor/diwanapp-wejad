import { useTaskStatusManagement } from "@/components/tasks/project-details/hooks/useTaskStatusManagement";
import { useAuthStore } from "@/store/authStore";

interface TaskStatusManagerProps {
  taskId: string;
  isSubtask: boolean;
  currentStatus: string;
  dueDate?: string | null;
  assignedTo?: string | null;
  projectId?: string | null;
  projectTitle?: string | null;
  taskTitle: string;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasksByStage: Record<string, Task[]>;
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>;
}

export const useTaskStatusManager = ({
  taskId,
  currentStatus,
  projectId,
  tasks,
  setTasks,
  tasksByStage,
  setTasksByStage,
  ...props
}: TaskStatusManagerProps) => {
  const { handleStatusChange, isUpdating } = useTaskStatusManagement(
    projectId,
    tasks,
    setTasks,
    tasksByStage, 
    setTasksByStage
  );

  return {
    isUpdating,
    handleStatusChange
  };
};
