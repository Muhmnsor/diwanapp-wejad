
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface PersonalTasksStatsProps {
  stats: {
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    overdueTasks: number;
  };
}

export const PersonalTasksStats = ({ stats }: PersonalTasksStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي المهام</p>
            <p className="font-bold text-lg">
              {stats.completedTasks + stats.pendingTasks + stats.inProgressTasks}
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مهام مكتملة</p>
            <p className="font-bold text-lg">{stats.completedTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">قيد التنفيذ</p>
            <p className="font-bold text-lg">{stats.inProgressTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مهام متأخرة</p>
            <p className="font-bold text-lg">{stats.overdueTasks}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
