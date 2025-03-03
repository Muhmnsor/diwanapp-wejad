
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  BarChart 
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
  // Determine progress status color based on completion percentage
  const getProgressColorClass = () => {
    if (completionPercentage >= 75) return "bg-green-500";
    if (completionPercentage >= 50) return "bg-blue-500";
    if (completionPercentage >= 25) return "bg-amber-500";
    return "bg-red-500";
  };

  return (
    <div className="border p-4 rounded-md">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">تقدم المشروع</h3>
        <div className="flex items-center gap-1">
          <BarChart className="h-4 w-4 text-gray-500" />
          <span className="font-bold text-lg">{completionPercentage}%</span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div className="relative pt-1">
          <Progress 
            value={completionPercentage} 
            className="h-3 rounded-full" 
          />
          <div 
            className={`absolute h-3 top-1 left-0 rounded-full transition-all ${getProgressColorClass()}`} 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center p-2 bg-green-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-700">مكتملة</span>
            </div>
            <span className="text-xl font-bold text-green-700">{completedTasksCount}</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-amber-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700">متأخرة</span>
            </div>
            <span className="text-xl font-bold text-amber-700">{overdueTasksCount}</span>
          </div>
          
          <div className="flex flex-col items-center p-2 bg-blue-50 rounded-md">
            <div className="flex items-center gap-1 mb-1">
              <ClipboardList className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">الإجمالي</span>
            </div>
            <span className="text-xl font-bold text-blue-700">{totalTasksCount}</span>
          </div>
        </div>
        
        {/* Visual progress indicator */}
        <div className="flex items-center justify-between pt-2">
          <div className="w-full bg-gray-100 rounded-full h-1.5">
            <div 
              className="h-1.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
