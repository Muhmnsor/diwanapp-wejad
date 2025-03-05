
import { useState } from 'react';
import { WorkspaceWithProjects, YearlyPlanFilters } from '../types/yearlyPlanTypes';

/**
 * Custom hook for managing yearly plan state
 */
export const useYearlyPlanState = () => {
  const [workspaces, setWorkspaces] = useState<WorkspaceWithProjects[]>([]);
  const [filters, setFilters] = useState<YearlyPlanFilters>({
    status: null,
    workspace: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // تبديل حالة توسيع مساحة العمل
  const toggleWorkspaceExpanded = (workspaceId: string) => {
    setWorkspaces(prevWorkspaces => 
      prevWorkspaces.map(workspace => 
        workspace.id === workspaceId 
          ? { ...workspace, expanded: !workspace.expanded } 
          : workspace
      )
    );
  };

  // تبديل حالة توسيع المشروع
  const toggleProjectExpanded = (projectId: string) => {
    setWorkspaces(prevWorkspaces => 
      prevWorkspaces.map(workspace => ({
        ...workspace,
        projects: workspace.projects.map(project => 
          project.id === projectId 
            ? { ...project, expanded: !project.expanded } 
            : project
        )
      }))
    );
  };

  return {
    workspaces,
    setWorkspaces,
    filters,
    setFilters,
    isLoading,
    setIsLoading,
    toggleWorkspaceExpanded,
    toggleProjectExpanded
  };
};
