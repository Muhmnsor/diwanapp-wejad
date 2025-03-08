
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Task } from "../../../types/task";
import { DependencyType } from "../../types/dependency";

interface DependencyListItemProps {
  task: Task;
  onRemove: (dependencyId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
  dependencyType?: DependencyType;
}

export const DependencyListItem = ({ 
  task, 
  onRemove, 
  getStatusBadge,
  dependencyType
}: DependencyListItemProps) => {
  // Function to display dependency type in a user-friendly way
  const getDependencyTypeLabel = (type?: DependencyType) => {
    if (!type) return "";
    
    switch (type) {
      case 'finish-to-start':
        return 'انتهاء لبداية (FS)';
      case 'start-to-start':
        return 'بداية لبداية (SS)';
      case 'finish-to-finish':
        return 'انتهاء لانتهاء (FF)';
      case 'start-to-finish':
        return 'بداية لانتهاء (SF)';
      default:
        return '';
    }
  };
  
  return (
    <li key={task.id} className="flex items-center justify-between p-2 border rounded-md">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {getStatusBadge(task.status)}
          <span>{task.title}</span>
        </div>
        {dependencyType && (
          <span className="text-xs text-gray-500">{getDependencyTypeLabel(dependencyType)}</span>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(task.id)}
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
};
