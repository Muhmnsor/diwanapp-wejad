import { TaskSubtask } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface SubtasksListProps {
  subtasks: TaskSubtask[];
}

export const SubtasksList = ({ subtasks }: SubtasksListProps) => {
  if (!subtasks.length) {
    return (
      <div className="text-center p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-500">لا توجد مهام فرعية</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-3 w-3 text-blue-500" />;
      default:
        return <Circle className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-2">
      {subtasks.map((subtask) => (
        <Card key={subtask.id} className="p-2">
          <div className="flex items-center gap-2">
            {getStatusIcon(subtask.status)}
            <span className="text-sm">{subtask.title}</span>
            <Badge variant="secondary" className="text-xs">
              {subtask.status}
            </Badge>
          </div>
          {subtask.description && (
            <p className="mt-1 text-xs text-gray-600">{subtask.description}</p>
          )}
        </Card>
      ))}
    </div>
  );
};