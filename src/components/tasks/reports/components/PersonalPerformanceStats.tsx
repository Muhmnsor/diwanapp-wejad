
import { Percent, Clock, Award, AlertTriangle } from "lucide-react";

interface PersonalPerformanceStatsProps {
  stats: {
    completionRate: number;
    averageDelayDays: number;
    earlyCompletions: number;
    lateCompletions: number;
  };
}

export const PersonalPerformanceStats = ({ stats }: PersonalPerformanceStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Percent className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">نسبة إنجاز المهام</p>
            <p className="font-bold text-lg">{stats.completionRate}%</p>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">متوسط وقت التأخير</p>
            <p className="font-bold text-lg">{stats.averageDelayDays} يوم</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <Award className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">المهام المنجزة قبل الموعد</p>
            <p className="font-bold text-lg">{stats.earlyCompletions}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">المهام المتأخرة</p>
            <p className="font-bold text-lg">{stats.lateCompletions}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
