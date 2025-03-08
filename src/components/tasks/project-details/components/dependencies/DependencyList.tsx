
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Task } from "../../types/task";

interface DependencyListProps {
  title: string;
  tasks: Task[];
  isLoading: boolean;
  emptyMessage: string;
  onRemove?: (taskId: string) => void;
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
        <div className="text-sm text-muted-foreground py-2 italic">
          {emptyMessage}
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <div className="flex flex-col gap-1">
                <div className="font-medium text-sm">{task.title}</div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(task.status)}
                  <span className="text-xs text-gray-500">
                    {task.dependency_type && (
                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                        {task.dependency_type === 'finish-to-start' ? 'انتهاء لبداية' :
                         task.dependency_type === 'start-to-start' ? 'بداية لبداية' :
                         task.dependency_type === 'finish-to-finish' ? 'انتهاء لانتهاء' : 'بداية لانتهاء'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              
              {!isDependent && onRemove && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 w-7 p-0"
                  onClick={() => onRemove(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
