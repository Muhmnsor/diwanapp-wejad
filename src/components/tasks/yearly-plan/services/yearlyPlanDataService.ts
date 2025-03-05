
import { 
  generateDemoWorkspaces, 
  generateDemoProjects, 
  generateDemoTasks, 
  createProjectsWithTasks 
} from '../utils/demoDataGenerator';
import { WorkspaceWithProjects } from '../types/yearlyPlanTypes';

/**
 * Fetches demo data for yearly plan
 */
export const fetchYearlyPlanData = async (year: number): Promise<WorkspaceWithProjects[]> => {
  try {
    // هذه بيانات تجريبية، ستُستبدل بجلب البيانات الفعلية من قاعدة البيانات
    const demoWorkspaces = generateDemoWorkspaces();
    const demoProjects = generateDemoProjects(year, demoWorkspaces);
    const demoTasks = generateDemoTasks(demoProjects);
    
    // تحويل المشاريع إلى الصيغة المطلوبة مع المهام المرتبطة بها
    const projectsWithTasks = createProjectsWithTasks(demoProjects, demoTasks);

    // تجميع المشاريع حسب مساحة العمل
    const workspacesWithProjects: WorkspaceWithProjects[] = demoWorkspaces.map(workspace => {
      const workspaceProjects = projectsWithTasks.filter(project => project.workspace_id === workspace.id);
      
      return {
        ...workspace,
        projects: workspaceProjects,
        expanded: true
      };
    });

    return workspacesWithProjects;
  } catch (error) {
    console.error('Error fetching yearly plan data:', error);
    return [];
  }
};
