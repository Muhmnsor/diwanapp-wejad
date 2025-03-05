
import { Briefcase, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface ProjectsOverviewStatsProps {
  stats: {
    totalProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    delayedProjects: number;
  };
}

export const ProjectsOverviewStats = ({ stats }: ProjectsOverviewStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <Briefcase className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">إجمالي المشاريع</p>
            <p className="font-bold text-lg">{stats.totalProjects}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-green-100 p-2 rounded-full">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">المشاريع المكتملة</p>
            <p className="font-bold text-lg">{stats.completedProjects}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Clock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">قيد التنفيذ</p>
            <p className="font-bold text-lg">{stats.inProgressProjects}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-red-50 p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">مشاريع متأخرة</p>
            <p className="font-bold text-lg">{stats.delayedProjects}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
