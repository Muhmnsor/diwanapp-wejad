
import { AlertCircle } from "lucide-react";
import { Task } from "../../../types/task";

interface DependencyWarningProps {
  taskStatus: string;
  dependentTasks: Task[];
}

export const DependencyWarning = ({ taskStatus, dependentTasks }: DependencyWarningProps) => {
  if (taskStatus === 'completed' && dependentTasks.some(t => t.status !== 'completed')) {
    return (
      <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <p className="text-sm text-yellow-700">
          تنبيه: هناك مهام تعتمد على هذه المهمة ولم تكتمل بعد
        </p>
      </div>
    );
  }
  
  return null;
};
