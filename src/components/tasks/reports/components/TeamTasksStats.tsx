
import { Users, CheckCircle2, BarChart, Briefcase } from "lucide-react";

interface TeamTasksStatsProps {
  stats: {
    totalTeamTasks: number;
    completedTeamTasks: number;
    teamCompletionRate: number;
    totalProjects: number;
  };
}

export const TeamTasksStats = ({ stats }: TeamTasksStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-purple-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-full">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي مهام الفريق</p>
            <p className="font-bold text-lg">{stats.totalTeamTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">المهام المنجزة</p>
            <p className="font-bold text-lg">{stats.completedTeamTasks}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <BarChart className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">معدل إنجاز المهام</p>
            <p className="font-bold text-lg">{stats.teamCompletionRate}%</p>
          </div>
        </div>
      </div>
      
      <div className="bg-amber-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-full">
            <Briefcase className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">المشاريع النشطة</p>
            <p className="font-bold text-lg">{stats.totalProjects}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
