
import { Task, Workspace, Project } from "@/types/workspace";

export interface ProjectWithTasks extends Project {
  tasks: Task[];
  expanded?: boolean;
  completedTasksCount: number;
  totalTasksCount: number;
  overdueTasksCount: number;
  completionPercentage: number;
}

export interface WorkspaceWithProjects extends Workspace {
  projects: ProjectWithTasks[];
  expanded?: boolean;
}

export interface YearlyPlanFilters {
  status: string | null;
  workspace: string | null;
}
