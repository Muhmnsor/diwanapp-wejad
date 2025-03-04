
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
    delayedTasks: number;
  }
}

export const TasksStats = ({ stats }: StatsProps) => {
  return (
    <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
      <div className="p-3 bg-blue-50 rounded-lg min-w-[200px]">
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
      
      <div className="p-3 bg-green-50 rounded-lg min-w-[200px]">
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
      
      <div className="p-3 bg-yellow-50 rounded-lg min-w-[200px]">
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
      
      <div className="p-3 bg-red-50 rounded-lg min-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مهام متأخرة</p>
            <p className="font-bold text-lg">{stats.delayedTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-purple-50 rounded-lg min-w-[200px]">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 p-2 rounded-full">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مواعيد استحقاق قريبة</p>
            <p className="font-bold text-lg">{stats.upcomingDeadlines}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
