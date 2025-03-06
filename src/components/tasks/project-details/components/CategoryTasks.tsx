
import { Task } from "../types/task";
import { TaskListItem } from "../../components/TaskListItem";

interface CategoryTasksProps {
  category: string;
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
  onTaskUpdated?: () => void;
}

export const CategoryTasks = ({ 
  category, 
  tasks, 
  onStatusChange, 
  onDelete,
  onTaskUpdated
}: CategoryTasksProps) => {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{category}</h3>
      <div className="space-y-3">
        {tasks.map(task => (
          <TaskListItem 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange}
            onDelete={onDelete}
            onTaskUpdated={onTaskUpdated}
          />
        ))}
      </div>
    </div>
  );
};
