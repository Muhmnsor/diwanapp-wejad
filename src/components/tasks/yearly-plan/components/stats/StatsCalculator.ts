
import { WorkspaceWithProjects } from "../../types/yearlyPlanTypes";

export const calculateProjectStats = (workspaces: WorkspaceWithProjects[]) => {
  // حساب إحصائيات المشاريع
  const totalProjects = workspaces.reduce(
    (total, workspace) => total + workspace.projects.length, 
    0
  );
  
  const completedProjects = workspaces.reduce(
    (total, workspace) => total + workspace.projects.filter(p => p.status === 'completed').length, 
    0
  );
  
  const inProgressProjects = workspaces.reduce(
    (total, workspace) => total + workspace.projects.filter(p => p.status === 'in_progress').length, 
    0
  );
  
  const delayedProjects = workspaces.reduce(
    (total, workspace) => total + workspace.projects.filter(p => p.status === 'delayed').length, 
    0
  );
  
  const pendingProjects = workspaces.reduce(
    (total, workspace) => total + workspace.projects.filter(p => p.status === 'pending').length, 
    0
  );
  
  // حساب نسبة الإكمال الإجمالية
  const completionPercentage = totalProjects > 0 
    ? Math.round((completedProjects / totalProjects) * 100) 
    : 0;

  return {
    totalProjects,
    completedProjects,
    inProgressProjects,
    delayedProjects,
    pendingProjects,
    completionPercentage,
    workspacesCount: workspaces.length
  };
};
