
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar,
  AlertCircle
} from "lucide-react";

interface StatsProps {
  stats: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    upcomingDeadlines: number;
    delayedTasks?: number;
  }
}

export const TasksStats = ({ stats }: StatsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 p-2 rounded-full">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي المهام</p>
            <p className="font-bold text-lg">{stats.totalTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-green-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مهام مكتملة</p>
            <p className="font-bold text-lg">{stats.completedTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-yellow-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">قيد التنفيذ</p>
            <p className="font-bold text-lg">{stats.pendingTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-amber-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="bg-amber-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مهام متأخرة</p>
            <p className="font-bold text-lg">{stats.delayedTasks || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
