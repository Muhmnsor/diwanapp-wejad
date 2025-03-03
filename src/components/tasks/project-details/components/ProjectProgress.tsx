
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2,
  AlertTriangle,
  ClipboardList 
} from "lucide-react";

interface ProjectProgressProps {
  completedTasksCount: number;
  totalTasksCount: number;
  overdueTasksCount: number;
  completionPercentage: number;
}

export const ProjectProgress = ({ 
  completedTasksCount, 
  totalTasksCount, 
  overdueTasksCount,
  completionPercentage
}: ProjectProgressProps) => {
  return (
    <div className="border p-4 rounded-md">
      <h3 className="font-medium mb-3">تقدم المشروع</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">نسبة الإنجاز</span>
          <span className="font-semibold">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1 text-sm bg-green-50 px-2 py-1 rounded">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>{completedTasksCount} مهام منجزة</span>
          </div>
          <div className="flex items-center gap-1 text-sm bg-amber-50 px-2 py-1 rounded">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>{overdueTasksCount} مهام متأخرة</span>
          </div>
          {totalTasksCount > 0 && (
            <div className="flex items-center gap-1 text-sm bg-blue-50 px-2 py-1 rounded">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              <span>{totalTasksCount} إجمالي المهام</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
