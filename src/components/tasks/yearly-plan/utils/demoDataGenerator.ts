
import { Task, Workspace, Project } from '@/types/workspace';
import { ProjectWithTasks } from '../types/yearlyPlanTypes';
import { startOfMonth, isBefore } from 'date-fns';

/**
 * Generates demo workspaces data
 */
export const generateDemoWorkspaces = (): Workspace[] => {
  return [
    {
      id: '1',
      name: 'مساحة العمل الرئيسية',
      description: 'المساحة الرئيسية للمشاريع الاستراتيجية',
      status: 'active',
      created_at: new Date().toISOString(),
      total_tasks: 12,
      completed_tasks: 5,
      pending_tasks: 7,
    },
    {
      id: '2',
      name: 'تطوير المنتجات',
      description: 'مساحة خاصة بتطوير المنتجات الجديدة',
      status: 'active',
      created_at: new Date().toISOString(),
      total_tasks: 8,
      completed_tasks: 3,
      pending_tasks: 5,
    },
    {
      id: '3',
      name: 'المشاريع التعليمية',
      description: 'مساحة للمشاريع التعليمية والتدريبية',
      status: 'active',
      created_at: new Date().toISOString(),
      total_tasks: 5,
      completed_tasks: 2,
      pending_tasks: 3,
    }
  ];
};

/**
 * Generates demo projects for the given year and workspaces
 */
export const generateDemoProjects = (year: number, workspaces: Workspace[]): Project[] => {
  const projects: Project[] = [];
  
  for (let i = 0; i < 8; i++) {
    const randomWorkspace = workspaces[Math.floor(Math.random() * workspaces.length)];
    const randomMonth = Math.floor(Math.random() * 10); // لضمان أن المشروع لا ينتهي بعد نهاية العام
    const randomDay = Math.floor(Math.random() * 20) + 1;
    const randomDuration = Math.floor(Math.random() * 60) + 30; // مدة المشروع من 30 إلى 90 يوم
    
    const startDate = new Date(year, randomMonth, randomDay);
    const endDate = new Date(year, randomMonth, randomDay + randomDuration);
    
    const statuses: Project['status'][] = ['pending', 'in_progress', 'completed', 'delayed', 'stopped'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    projects.push({
      id: `project-${i+1}`,
      name: `مشروع ${i+1}`,
      description: `وصف المشروع رقم ${i+1}`,
      status: randomStatus,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      created_at: new Date(year, randomMonth, randomDay - 10).toISOString(),
      workspace_id: randomWorkspace.id,
    });
  }
  
  return projects;
};

/**
 * Generates demo tasks for the given projects
 */
export const generateDemoTasks = (projects: Project[]): Task[] => {
  const tasks: Task[] = [];
  
  projects.forEach(project => {
    const projectStartDate = new Date(project.start_date!);
    const projectEndDate = new Date(project.end_date!);
    
    // إنشاء 3-7 مهام لكل مشروع
    const tasksCount = Math.floor(Math.random() * 5) + 3;
    
    for (let i = 0; i < tasksCount; i++) {
      // توزيع المهام على فترة المشروع
      const taskOffset = Math.floor((projectEndDate.getTime() - projectStartDate.getTime()) * (i / tasksCount));
      const taskDuration = Math.floor(Math.random() * 14) + 3; // مدة المهمة من 3 إلى 16 يوم
      
      const taskStartDate = new Date(projectStartDate.getTime() + taskOffset);
      const taskEndDate = new Date(taskStartDate.getTime() + (taskDuration * 24 * 60 * 60 * 1000));
      
      // تأكد من أن تاريخ انتهاء المهمة لا يتجاوز تاريخ انتهاء المشروع
      const finalEndDate = isBefore(taskEndDate, projectEndDate) ? taskEndDate : projectEndDate;
      
      tasks.push({
        id: `task-${project.id}-${i+1}`,
        title: `مهمة ${i+1} للمشروع ${project.id}`,
        description: `وصف المهمة رقم ${i+1} للمشروع ${project.id}`,
        status: ['pending', 'in_progress', 'completed'][Math.floor(Math.random() * 3)] as 'pending' | 'in_progress' | 'completed',
        priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        due_date: finalEndDate.toISOString(),
        created_at: new Date(taskStartDate.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
        workspace_id: project.workspace_id,
        project_id: project.id,
        start_date: taskStartDate.toISOString(),
        end_date: finalEndDate.toISOString()
      });
    }
  });
  
  return tasks;
};

/**
 * Converts projects and tasks to ProjectWithTasks format
 */
export const createProjectsWithTasks = (projects: Project[], tasks: Task[]): ProjectWithTasks[] => {
  return projects.map(project => {
    const projectTasks = tasks.filter(task => task.project_id === project.id);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const overdueTasks = projectTasks.filter(task => {
      return task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();
    });
    
    return {
      ...project,
      tasks: projectTasks,
      expanded: false,
      completedTasksCount: completedTasks.length,
      totalTasksCount: projectTasks.length,
      overdueTasksCount: overdueTasks.length,
      completionPercentage: projectTasks.length > 0 
        ? Math.round((completedTasks.length / projectTasks.length) * 100) 
        : 0
    };
  });
};

/**
 * Generates months array for a given year
 */
export const getMonthsOfYear = (year: number): Date[] => {
  const months = [];
  for (let i = 0; i < 12; i++) {
    months.push(startOfMonth(new Date(year, i, 1)));
  }
  return months;
};
