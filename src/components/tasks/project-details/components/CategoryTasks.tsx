
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "../types/task";
import { useRef, useState } from "react";
import { TaskListItem } from "../../components/TaskListItem";
import { useAuthStore } from "@/store/authStore";

interface CategoryTasksProps {
  category: string;
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onTaskUpdated: () => void;
}

export const CategoryTasks = ({ 
  category, 
  tasks,
  onStatusChange,
  onDelete,
  onTaskUpdated
}: CategoryTasksProps) => {
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const updatingTaskId = useRef<string | null>(null);

  if (!tasks || tasks.length === 0) {
    return null;
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    updatingTaskId.current = taskId;

    try {
      await onStatusChange(taskId, newStatus);
    } finally {
      setIsUpdating(false);
      updatingTaskId.current = null;
    }
  };

  const handleTaskDeleted = async (taskId: string) => {
    if (isUpdating) return;

    setIsUpdating(true);
    updatingTaskId.current = taskId;

    try {
      await onDelete(taskId);
    } finally {
      setIsUpdating(false);
      updatingTaskId.current = null;
    }
  };

  return (
    <Card>
      <CardHeader className="py-4">
        <CardTitle className="text-xl">{category}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-4">
          {tasks.map((task) => (
            <TaskListItem
              key={task.id}
              task={task}
              onStatusChange={(status) => handleStatusChange(task.id, status)}
              isUpdating={isUpdating && updatingTaskId.current === task.id}
              onDelete={() => handleTaskDeleted(task.id)}
              currentUserId={user?.id}
              onTaskUpdated={onTaskUpdated}
              isGeneral={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
