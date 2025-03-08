
import { Task } from "../../../types/task";
import { Loader2 } from "lucide-react";
import { DependencyListItem } from "./DependencyListItem";

interface DependencyListProps {
  title: string;
  tasks: Task[];
  isLoading: boolean;
  emptyMessage: string;
  onRemove?: (dependencyId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  isDependent?: boolean;
}

export const DependencyList = ({
  title,
  tasks,
  isLoading,
  emptyMessage,
  onRemove,
  getStatusBadge,
  isDependent = false
}: DependencyListProps) => {
  return (
    <div>
      <h3 className="text-sm font-medium mb-2">{title}</h3>
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            isDependent ? (
              <li key={task.id} className="flex items-center justify-between p-2 border rounded-md">
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  <span>{task.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  لا يمكن إكمالها حتى تكتمل هذه المهمة
                </div>
              </li>
            ) : (
              <DependencyListItem 
                key={task.id}
                task={task} 
                onRemove={onRemove!} 
                getStatusBadge={getStatusBadge} 
                dependencyType={task.dependency_type}
              />
            )
          ))}
        </ul>
      )}
    </div>
  );
};
