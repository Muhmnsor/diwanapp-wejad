
import { WorkspaceWithProjects, YearlyPlanFilters } from '../types/yearlyPlanTypes';

/**
 * Applies filters to workspaces and projects data
 */
export const applyFilters = (
  workspaces: WorkspaceWithProjects[], 
  filters: YearlyPlanFilters
): WorkspaceWithProjects[] => {
  return workspaces
    .map(workspace => {
      if (filters.workspace && filters.workspace !== workspace.id) {
        return { ...workspace, projects: [] };
      }

      const filteredProjects = workspace.projects.filter(project => {
        if (filters.status && project.status !== filters.status) {
          return false;
        }
        return true;
      });

      return { ...workspace, projects: filteredProjects };
    })
    .filter(workspace => workspace.projects.length > 0 || !filters.workspace);
};
