import { Project } from "./project";
import { ProjectTask } from "./task";

export interface Department {
  id: string;
  name: string;
  description?: string;
  asana_gid?: string;
  created_at: string;
  updated_at: string;
  department_projects?: DepartmentProject[];
}

export interface DepartmentProject {
  id: string;
  department_id: string;
  project_id: string;
  asana_gid?: string;
  created_at: string;
  project: Project;
  project_tasks?: ProjectTask[];
}