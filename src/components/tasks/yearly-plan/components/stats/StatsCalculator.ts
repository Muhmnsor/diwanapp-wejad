
import { WorkspaceWithProjects } from "../../types/yearlyPlanTypes";
import { Project } from "@/types/workspace";

export interface ProjectStats {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  delayedProjects: number;
  pendingProjects: number;
  completionPercentage: number;
  workspacesCount: number;
}

export const calculateProjectStats = (workspaces: WorkspaceWithProjects[]): ProjectStats => {
  // التعامل مع الحالة التي تكون فيها workspaces فارغة
  if (!workspaces || workspaces.length === 0) {
    return {
      totalProjects: 0,
      completedProjects: 0,
      inProgressProjects: 0,
      delayedProjects: 0,
      pendingProjects: 0,
      completionPercentage: 0,
      workspacesCount: 0
    };
  }

  // جمع كل المشاريع من جميع مساحات العمل
  const allProjects = workspaces.flatMap(workspace => workspace.projects || []);
  
  // حساب إحصائيات المشاريع
  const totalProjects = allProjects.length;
  const completedProjects = allProjects.filter(p => p.status === 'completed').length;
  const inProgressProjects = allProjects.filter(p => p.status === 'in_progress').length;
  const delayedProjects = allProjects.filter(p => p.status === 'delayed').length;
  const pendingProjects = allProjects.filter(p => p.status === 'pending').length;
  
  // حساب نسبة الإكمال
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
