
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, BarChart } from "lucide-react";
import { StatsCard } from "./StatsCard";
import { ProgressCard } from "./ProgressCard";
import { calculateProjectStats } from "./StatsCalculator";
import { WorkspaceWithProjects } from "../../types/yearlyPlanTypes";

interface YearlyPlanStatsGridProps {
  workspaces: WorkspaceWithProjects[];
}

export const YearlyPlanStatsGrid = ({ workspaces }: YearlyPlanStatsGridProps) => {
  // حساب الإحصائيات من البيانات
  const {
    totalProjects,
    completedProjects,
    inProgressProjects,
    delayedProjects,
    completionPercentage,
    workspacesCount
  } = calculateProjectStats(workspaces);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatsCard 
        title="إجمالي المشاريع"
        value={totalProjects}
        subtitle={`في ${workspacesCount} مساحة عمل`}
        icon={ClipboardList}
      />
      
      <StatsCard 
        title="المشاريع المكتملة"
        value={completedProjects}
        subtitle={`بنسبة ${completionPercentage}% من المشاريع`}
        icon={CheckCircle2}
        iconColor="text-green-600"
        valueColor="text-green-600"
      />
      
      <StatsCard 
        title="المشاريع قيد التنفيذ"
        value={inProgressProjects}
        subtitle={`بنسبة ${totalProjects > 0 ? Math.round((inProgressProjects / totalProjects) * 100) : 0}% من المشاريع`}
        icon={Clock}
        iconColor="text-blue-600"
        valueColor="text-blue-600"
      />
      
      <StatsCard 
        title="المشاريع المتعثرة"
        value={delayedProjects}
        subtitle={`بنسبة ${totalProjects > 0 ? Math.round((delayedProjects / totalProjects) * 100) : 0}% من المشاريع`}
        icon={AlertTriangle}
        iconColor="text-red-600"
        valueColor="text-red-600"
      />
      
      <ProgressCard 
        title="نسبة الإكمال الإجمالية"
        percentage={completionPercentage}
        value={completedProjects}
        total={totalProjects}
        icon={BarChart}
        iconColor="text-amber-600"
        valueColor="text-amber-600"
      />
    </div>
  );
};
