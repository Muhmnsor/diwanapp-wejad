
import { YearlyPlanStatsGrid } from "./stats/YearlyPlanStatsGrid";
import { WorkspaceWithProjects } from "../types/yearlyPlanTypes";

interface YearlyPlanStatsProps {
  workspaces: WorkspaceWithProjects[];
}

export const YearlyPlanStats = ({ workspaces }: YearlyPlanStatsProps) => {
  return (
    <div className="mb-6">
      <YearlyPlanStatsGrid workspaces={workspaces} />
    </div>
  );
};
