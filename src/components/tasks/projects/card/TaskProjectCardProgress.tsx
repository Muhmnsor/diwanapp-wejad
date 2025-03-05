
import { Progress } from "@/components/ui/progress";
import { CheckSquare, AlertTriangle, ListTodo } from "lucide-react";

interface TaskProjectCardProgressProps {
  completionPercentage: number;
  completedTasksCount: number;
  overdueTasksCount: number;
  totalTasksCount: number;
}

export const TaskProjectCardProgress = ({ 
  completionPercentage, 
  completedTasksCount, 
  overdueTasksCount, 
  totalTasksCount 
}: TaskProjectCardProgressProps) => {
  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">نسبة الإنجاز</span>
        <span className="font-semibold">{completionPercentage}%</span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      
      <div className="grid grid-cols-3 gap-3 mt-3">
        <div className="flex items-center gap-1 text-sm">
          <CheckSquare className="h-4 w-4 text-green-500" />
          <span>{completedTasksCount} منجزة</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span>{overdueTasksCount} متأخرة</span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <ListTodo className="h-4 w-4 text-blue-500" />
          <span>{totalTasksCount} الكل</span>
        </div>
      </div>
    </div>
  );
};
