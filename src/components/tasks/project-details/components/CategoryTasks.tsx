
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Task } from "../types/task";
import { TaskListItem } from "../../components/TaskListItem";
import { getStatusBadge, getPriorityBadge, formatDate } from "../utils/taskFormatters";

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
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{category}</h3>
          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onDelete={onDelete}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
