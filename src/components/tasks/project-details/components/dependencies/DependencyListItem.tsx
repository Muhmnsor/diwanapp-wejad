
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Task } from "../../../types/task";

interface DependencyListItemProps {
  task: Task;
  onRemove: (dependencyId: string) => void;
  getStatusBadge: (status: string) => JSX.Element;
}

export const DependencyListItem = ({ 
  task, 
  onRemove, 
  getStatusBadge 
}: DependencyListItemProps) => {
  return (
    <li key={task.id} className="flex items-center justify-between p-2 border rounded-md">
      <div className="flex items-center gap-2">
        {getStatusBadge(task.status)}
        <span>{task.title}</span>
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
