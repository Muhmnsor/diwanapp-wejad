
import { Task } from "../types/task";
import { TaskListItem } from "../../components/TaskListItem";

interface CategoryTasksProps {
  category: string;
  tasks: Task[];
  onStatusChange: (taskId: string, status: string) => void;
  onDelete?: (taskId: string) => void;
}

export const CategoryTasks = ({ 
  category, 
  tasks, 
  onStatusChange,
  onDelete
}: CategoryTasksProps) => {
  if (!tasks || tasks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="bg-gray-50 p-3 rounded-lg border">
        <h3 className="font-medium text-gray-800">{category}</h3>
      </div>
      <div className="grid gap-3">
        {tasks.map(task => (
          <TaskListItem 
            key={task.id} 
            task={task} 
            onStatusChange={onStatusChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
