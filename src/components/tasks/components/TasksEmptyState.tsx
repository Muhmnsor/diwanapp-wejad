
import { ClipboardList } from "lucide-react";

interface TasksEmptyStateProps {
  message: string;
}

export const TasksEmptyState = ({ message }: TasksEmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 bg-muted/20 rounded-lg p-6">
      <ClipboardList className="h-10 w-10 text-muted-foreground mb-4" />
      <p className="text-muted-foreground text-center">{message}</p>
    </div>
  );
};
