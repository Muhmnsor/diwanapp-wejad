
import { YearlyPlanStatsGrid } from "./stats/YearlyPlanStatsGrid";
import { WorkspaceWithProjects } from "../types/yearlyPlanTypes";

interface YearlyPlanStatsProps {
  workspaces: WorkspaceWithProjects[];
}

export const YearlyPlanStats = ({ workspaces }: YearlyPlanStatsProps) => {
  // التأكد من أن workspaces موجودة وليست فارغة
  if (!workspaces || workspaces.length === 0) {
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-md text-center">
        لا توجد بيانات لعرضها
      </div>
    );
  }
  
  return (
    <div className="mb-6">
      <YearlyPlanStatsGrid workspaces={workspaces} />
    </div>
  );
};
