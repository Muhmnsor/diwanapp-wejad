
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ClipboardList, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  BarChart 
} from "lucide-react";
import { WorkspaceWithProjects } from "../types/yearlyPlanTypes";

interface YearlyPlanStatsProps {
  workspaces: WorkspaceWithProjects[];
}

export const YearlyPlanStats = ({ workspaces }: YearlyPlanStatsProps) => {
  // حساب إحصائيات المشاريع
  const totalProjects = workspaces.reduce((total, workspace) => 
    total + workspace.projects.length, 0);
  
  const completedProjects = workspaces.reduce((total, workspace) => 
    total + workspace.projects.filter(p => p.status === 'completed').length, 0);
  
  const inProgressProjects = workspaces.reduce((total, workspace) => 
    total + workspace.projects.filter(p => p.status === 'in_progress').length, 0);
  
  const delayedProjects = workspaces.reduce((total, workspace) => 
    total + workspace.projects.filter(p => p.status === 'delayed').length, 0);
  
  const pendingProjects = workspaces.reduce((total, workspace) => 
    total + workspace.projects.filter(p => p.status === 'pending').length, 0);
  
  // حساب نسبة الإكمال الإجمالية
  const completionPercentage = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            إجمالي المشاريع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProjects}</div>
          <div className="text-xs text-gray-500 mt-1">في {workspaces.length} مساحة عمل</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            المشاريع المكتملة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedProjects}</div>
          <div className="text-xs text-gray-500 mt-1">بنسبة {completionPercentage}% من المشاريع</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            المشاريع قيد التنفيذ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{inProgressProjects}</div>
          <div className="text-xs text-gray-500 mt-1">بنسبة {totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0}% من المشاريع</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            المشاريع المتعثرة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{delayedProjects}</div>
          <div className="text-xs text-gray-500 mt-1">بنسبة {totalProjects > 0 ? Math.round((delayedProjects / totalProjects) * 100) : 0}% من المشاريع</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-amber-600 flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            نسبة الإكمال الإجمالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600">{completionPercentage}%</div>
          <div className="text-xs text-gray-500 mt-1">{completedProjects} من {totalProjects} مشروع</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div 
              className="bg-amber-500 h-1.5 rounded-full" 
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
