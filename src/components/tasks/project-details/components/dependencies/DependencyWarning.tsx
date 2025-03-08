
import { AlertCircle } from "lucide-react";
import { useDependencyContext } from "./DependencyContext";

export const DependencyWarning = () => {
  const { dependentTasks } = useDependencyContext();
  
  // We need to get the current task status from the context
  // For now, we'll just check if any dependent tasks are not completed
  if (dependentTasks.some(t => t.status !== 'completed')) {
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
