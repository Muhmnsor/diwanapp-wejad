
import { Progress } from "@/components/ui/progress";

interface WorkspaceProgressProps {
  totalTasks: number;
  completedTasks: number;
}

export const WorkspaceProgress = ({ totalTasks, completedTasks }: WorkspaceProgressProps) => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">تقدم المهام</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>اكتمل: {completedTasks} من أصل {totalTasks}</span>
        <span>متبقي: {totalTasks - completedTasks}</span>
      </div>
    </div>
  );
};
